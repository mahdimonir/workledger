import { Global, Module }  from '@nestjs/common';
import { ConfigService }   from '@nestjs/config';
import { RedisService }    from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_OPTIONS',
      inject:  [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get('redis.url') || config.get('REDIS_URL') || 'redis://localhost:6379',
      }),
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class CacheModule {}
