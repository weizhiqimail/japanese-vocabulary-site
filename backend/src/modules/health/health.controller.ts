import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '@/common/decorators/public.decorator';

@Public()
@ApiTags('健康检查')
@Controller()
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  @ApiOperation({
    summary: '检查服务进程存活状态',
    description:
      '公开的轻量存活探针，不访问数据库。负载均衡器和监控系统可用它判断 NestJS 进程是否能够响应。',
  })
  @ApiOkResponse({
    description: '服务进程正常响应',
    schema: {
      example: {
        success: true,
        data: { status: 'ok' },
        message: '操作成功',
      },
    },
  })
  health() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({
    summary: '检查服务及数据库就绪状态',
    description:
      '公开的就绪探针，通过 SELECT 1 验证 MySQL 连接。只有返回 HTTP 200 时才应向该实例发送业务流量。',
  })
  @ApiOkResponse({
    description: '数据库连接正常，服务可以接收业务流量',
    schema: {
      example: {
        success: true,
        data: { status: 'ready' },
        message: '操作成功',
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: '数据库连接或查询失败',
    schema: {
      example: {
        success: false,
        data: null,
        message: '服务器内部错误',
      },
    },
  })
  async ready() {
    try {
      await this.dataSource.query('SELECT 1');

      return { status: 'ready' };
    } catch {
      throw new ServiceUnavailableException('数据库暂不可用');
    }
  }
}
