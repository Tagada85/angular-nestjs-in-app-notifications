import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { User, UserSummary } from '../models';

const MESSAGE_MAX_LENGTH = 280;

interface Feedback {
  kind: 'success' | 'error';
  text: string;
}

@Component({
  selector: 'app-kudos-page',
  imports: [ReactiveFormsModule],
  templateUrl: './kudos-page.html',
  styleUrl: './kudos-page.css'
})
export class KudosPage implements OnInit {
  /** The current user's id, read from the URL: /?user=alice */
  readonly user = input<string>();

  private readonly api = inject(ApiService);

  protected readonly users = signal<UserSummary[]>([]);
  protected readonly currentUser = signal<User | null>(null);
  protected readonly recipients = computed(() => this.users().filter((user) => user.id !== this.currentUser()?.id));
  protected readonly sending = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);
  protected readonly messageMaxLength = MESSAGE_MAX_LENGTH;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    toUserId: ['', Validators.required],
    message: ['', [Validators.required, Validators.maxLength(MESSAGE_MAX_LENGTH)]]
  });

  ngOnInit(): void {
    this.api.listUsers().subscribe((users) => this.users.set(users));

    const userId = this.user();
    if (!userId) return;
    this.api.openSession(userId).subscribe({
      next: (user) => this.currentUser.set(user),
      error: () => this.feedback.set({ kind: 'error', text: `There is no user "${userId}".` })
    });
  }

  protected send(): void {
    const from = this.currentUser();
    if (!from || this.form.invalid) return;

    const { toUserId, message } = this.form.getRawValue();
    this.sending.set(true);
    this.feedback.set(null);
    this.api.sendKudos({ fromUserId: from.id, toUserId, message }).subscribe({
      next: (kudos) => {
        this.feedback.set({ kind: 'success', text: `Kudos sent to ${kudos.to.name}.` });
        this.form.reset();
        this.sending.set(false);
      },
      error: () => {
        this.feedback.set({ kind: 'error', text: 'The kudos could not be sent. Try again.' });
        this.sending.set(false);
      }
    });
  }
}
