import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import {
  Duty,
  GOAL_HOURS,
  LibraryDataService,
  SLOT_RANGE,
  Student,
  fromKey,
} from '../../services/library-data.service';

@Component({
  selector: 'app-records',
  templateUrl: './records.page.html',
  styleUrls: ['./records.page.scss'],
  standalone: false,
})
export class RecordsPage {
  readonly goal = GOAL_HOURS;
  readonly range = SLOT_RANGE;
  selectedId: number | null;

  constructor(public data: LibraryDataService, private alerts: AlertController) {
    const preferred = this.data.students.find((s) => s.name === 'Augustine Simpao');
    this.selectedId = (preferred ?? this.data.students[0])?.id ?? null;
  }

  get student(): Student | undefined {
    return this.selectedId == null ? undefined : this.data.studentById(this.selectedId);
  }

  get completed(): Duty[] {
    return this.student ? this.data.completedDuties(this.student.id) : [];
  }

  get hours(): number {
    return this.completed.reduce((sum, d) => sum + d.hours, 0);
  }

  get percent(): number {
    return Math.min(100, Math.round((this.hours / this.goal) * 100));
  }

  get remaining(): number {
    return Math.max(0, this.goal - this.hours);
  }

  get gallery(): Duty[] {
    return this.completed.slice(0, 6);
  }

  trackById(_: number, d: Duty) {
    return d.id;
  }

  // ----- photo upload -----
  async onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const target = this.completed.find((d) => !d.photo);
    if (!target) {
      const a = await this.alerts.create({
        header: 'No free duty day',
        message: 'Every recent duty session already has a photo.',
        buttons: ['OK'],
      });
      await a.present();
      return;
    }

    const url = await this.downscale(file);
    this.data.setPhoto(target.id, url);
  }

  /** Shrink the image so it fits comfortably in localStorage. */
  private downscale(file: File, maxSide = 900): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Could not read image'));
        img.onload = () => {
          const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  // ----- certificate / PDF -----
  async printCertificate() {
    const s = this.student;
    if (!s) return;

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const fmt = (key: string) =>
      fromKey(key).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // header band
    doc.setFillColor(0, 41, 138);
    doc.rect(0, 0, W, 90, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Pamantasan ng Lungsod ng Valenzuela', W / 2, 42, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Student Library Duty Social Contract', W / 2, 62, { align: 'center' });

    // title
    doc.setTextColor(0, 41, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Service Record', W / 2, 150, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('This record shows the completed library duty hours of', W / 2, 185, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(s.name, W / 2, 218, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(s.section, W / 2, 238, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(
      `${this.hours} of ${this.goal} hours completed (${this.percent}%)`,
      W / 2,
      272,
      { align: 'center' }
    );

    // table
    let y = 320;
    const left = 70;
    doc.setFillColor(243, 245, 249);
    doc.rect(left - 8, y - 16, W - 2 * left + 16, 24, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Date', left, y);
    doc.text('Time', left + 160, y);
    doc.text('Hours', left + 330, y);
    doc.text('Status', left + 390, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    y += 28;
    for (const d of this.completed) {
      if (y > 760) {
        doc.addPage();
        y = 70;
      }
      doc.text(fmt(d.date), left, y);
      doc.text(this.range, left + 160, y);
      doc.text(`${d.hours} h`, left + 330, y);
      doc.text('Recorded', left + 390, y);
      doc.setDrawColor(227, 231, 238);
      doc.line(left - 8, y + 10, W - left + 8, y + 10);
      y += 28;
    }
    if (this.completed.length === 0) {
      doc.text('No completed duty sessions yet.', left, y);
    }

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated ${fmt(new Date().toISOString().slice(0, 10))}`, W / 2, 810, {
      align: 'center',
    });

    doc.save(`service-record-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`);
  }
}
