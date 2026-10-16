import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// 资料版本与状态（用于页面标题下方的可见标记）
				gameVersion: z.string().optional(),
				verifiedDate: z.union([z.string(), z.date()]).optional(),
				reviewStatus: z.string().optional(),
				versionStatus: z
					.enum(['1.0-official', 'ea-verified', '1.0-announced', '1.0-pending', 'mixed'])
					.optional(),
				sources: z
					.array(
						z.object({
							type: z.string(),
							reference: z.string(),
							// 来源元数据（可选）：便于追溯与判断证据等级
							url: z.string().optional(),
							date: z.string().optional(),
							channel: z.string().optional(),
							author: z.string().optional(),
							nature: z.string().optional(),
							appliesTo: z.string().optional(),
							status: z.string().optional(),
						}),
					)
					.optional(),
			}),
		}),
	}),
};