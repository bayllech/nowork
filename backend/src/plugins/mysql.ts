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
    connectionLimit: 10
  });
};

export default fp(mysqlPlugin);
