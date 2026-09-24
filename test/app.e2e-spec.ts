import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .expect(/NestJs Chat App/);
  });

  it('/index.js (GET)', () => {
    return request(app.getHttpServer())
      .get('/index.js')
      .expect('Content-Type', /javascript/)
      .expect(200);
  });

  it('/index.css (GET)', () => {
    return request(app.getHttpServer())
      .get('/index.css')
      .expect('Content-Type', /text\/css/)
      .expect(200);
  });
});
