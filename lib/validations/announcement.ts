import * as z from "zod";

export const announcementSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});
