import fastifyMysql from '@fastify/mysql';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { env } from '../config/env';

const mysqlPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyMysql, {
    promise: true,
    type: 'pool',
    host: env.mysql.host,
    port: env.mysql.port,
    database: env.mysql.database,
    user: env.mysql.user,
    password: env.mysql.password,
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
    // 设置连接字符集，确保中文正常显示
    typeCast: function (field: any, next: any) {
      if (field.type === 'VAR_STRING' || field.type === 'STRING' || field.type === 'BLOB') {
        return field.string();
      }
      return next();
    }
  });
};

export default fp(mysqlPlugin);
