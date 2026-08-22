import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('Health endpoints', () => {
  let app: INestApplication;

  const dataSource = { query: jest.fn() };

  const httpServer = () =>
    app.getHttpServer() as Parameters<typeof request>[0];

  beforeEach(async () => {
    dataSource.query.mockReset().mockResolvedValue([{ one: 1 }]);
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DataSource, useValue: dataSource }],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(() => app.close());

  it('reports process health', () =>
    request(httpServer()).get('/api/health').expect(200, {
      status: 'ok',
    }));

  it('reports database readiness', () =>
    request(httpServer()).get('/api/ready').expect(200, {
      status: 'ready',
    }));

  it('returns 503 when the database is unavailable', async () => {
    dataSource.query.mockRejectedValueOnce(new Error('offline'));
    await request(httpServer()).get('/api/ready').expect(503);
  });

  it('publishes both probes in the Swagger document', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('test').build(),
    );

    expect(document.paths['/api/health']?.get).toBeDefined();
    expect(document.paths['/api/ready']?.get?.responses).toHaveProperty('503');
  });
});
