import type { FastifyInstance } from 'fastify';
import { getRoleByKey, getRoles, type RoleRow } from '../services/role.service';
import { roleDefinitions } from '../data/roles';
import { rolesQuerySchema } from '../schemas/roles.schema';

export default async function rolesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const parseResult = rolesQuerySchema.safeParse(request.query ?? {});
    if (!parseResult.success) {
      const message = parseResult.error.errors.map((err) => err.message).join('; ');
      return reply.badRequest(message);
    }

    const { level, limit, badge } = parseResult.data;

    try {
      const result = await getRoles(app.mysql, { level, limit, badge });

      const transformedRoles = result.roles.map((role: RoleRow) => ({
        key: role.role_key,
        title: role.title,
        description: role.description ?? '',
        quote: role.quote ?? '',
        icon: role.icon,
        colorFrom: role.color_from,
        colorTo: role.color_to,
        badge: role.badge ?? undefined,
        level: role.level
      }));

      return reply.send({
        count: transformedRoles.length,
        roles: transformedRoles
      });
    } catch (error) {
      app.log.warn({ err: error }, '数据库查询角色信息失败，使用硬编码角色数据');

      const filtered = roleDefinitions.filter((role) => {
        if (level !== undefined && role.level < level) {
          return false;
        }
        if (badge && role.badge !== badge) {
          return false;
        }
        return true;
      });

      const size = limit ?? filtered.length;
      const result = filtered.slice(0, size);

      return reply.send({
        count: result.length,
        roles: result
      });
    }
  });

  // 获取单个角色详情
  app.get('/:roleKey', async (request, reply) => {
    const { roleKey } = request.params as { roleKey: string };

    if (!roleKey) {
      return reply.badRequest('角色标识不能为空');
    }

    try {
      const role = await getRoleByKey(app.mysql, roleKey);

      if (role) {
        const transformedRole = {
          key: role.role_key,
          title: role.title,
          description: role.description ?? '',
          quote: role.quote ?? '',
          icon: role.icon,
          colorFrom: role.color_from,
          colorTo: role.color_to,
          badge: role.badge ?? undefined,
          level: role.level
        };
        return reply.send(transformedRole);
      }
    } catch (error) {
      app.log.warn({ err: error }, '数据库查询单个角色失败，从硬编码数据查找角色');
    }

    // 从硬编码数据查找
    const role = roleDefinitions.find(r => r.key === roleKey);
    if (!role) {
      return reply.notFound('角色不存在');
    }

    return reply.send(role);
  });
}
