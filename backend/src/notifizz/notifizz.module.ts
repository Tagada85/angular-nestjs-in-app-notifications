import { Module } from '@nestjs/common';
import { NotifizzClient } from '@notifizz/nodejs';
import { notifizzKeys } from './notifizz-keys.js';

@Module({
  providers: [
    {
      // One Notifizz client for the whole app, injected where it is needed.
      provide: NotifizzClient,
      useFactory: () => {
        const { authSecretKey, sdkSecretKey } = notifizzKeys();
        return new NotifizzClient(authSecretKey, sdkSecretKey);
      },
    },
  ],
  exports: [NotifizzClient],
})
export class NotifizzModule {}
