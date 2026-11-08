import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { LibraryDataService, Student } from '../../services/library-data.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
  standalone: false,
})
export class StudentsPage {
  term = '';

  constructor(public data: LibraryDataService, private alerts: AlertController) {}

  get filtered(): Student[] {
    const t = this.term.trim().toLowerCase();
    if (!t) return this.data.students;
    return this.data.students.filter(
      (s) => s.name.toLowerCase().includes(t) || s.section.toLowerCase().includes(t)
    );
  }

  trackById(_: number, s: Student) {
    return s.id;
  }

  async add() {
    await this.openForm('Add student', '', '', (name, section) =>
      this.data.addStudent(name, section)
    );
  }

  async edit(s: Student) {
    await this.openForm('Edit student', s.name, s.section, (name, section) =>
      this.data.updateStudent(s.id, name, section)
    );
  }

  async remove(s: Student) {
    const alert = await this.alerts.create({
      header: 'Remove student?',
      message: `${s.name} and their duty records will be removed.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Remove', role: 'destructive', handler: () => this.data.removeStudent(s.id) },
      ],
    });
    await alert.present();
  }

  private async openForm(
    header: string,
    name: string,
    section: string,
    onSave: (name: string, section: string) => void
  ) {
    const alert = await this.alerts.create({
      header,
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Full name', value: name },
        { name: 'section', type: 'text', placeholder: 'Section (e.g. BSIT 2-1)', value: section },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (v: { name?: string; section?: string }) => {
            if (!v.name?.trim() || !v.section?.trim()) return false;
            onSave(v.name, v.section);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }
}
