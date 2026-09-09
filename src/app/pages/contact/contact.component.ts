import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  sent = signal(false);
  name = '';
  email = '';
  message = '';

  submit(): void {
    this.sent.set(true);
  }
}
