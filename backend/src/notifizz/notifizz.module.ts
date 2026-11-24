import { Module } from '@nestjs/common';
import { NotifizzClient } from '@notifizz/nodejs';
import { notifizzKeys } from './notifizz-keys.js';

@Module({
  providers: [
    {
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
