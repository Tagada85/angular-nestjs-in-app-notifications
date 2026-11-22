import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Kudos, SendKudosRequest, User, UserSummary } from './models';

// The Angular dev server forwards /api to the NestJS backend (proxy.conf.json).
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  listUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>('/api/users');
  }

  openSession(userId: string): Observable<User> {
    return this.http.post<User>('/api/session', { userId });
  }

  sendKudos(request: SendKudosRequest): Observable<Kudos> {
    return this.http.post<Kudos>('/api/kudos', request);
  }
}
