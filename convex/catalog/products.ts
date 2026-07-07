
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

export const search = query({
  args: { term: v.string() },
  handler: async (ctx, args) => {
    if (!args.term.trim()) return [];
    const all = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    const lower = args.term.toLowerCase();
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.description ?? "").toLowerCase().includes(lower)
    );
  },
});

export const seed = mutation({
  args: { categoryIds: v.record(v.string(), v.id("categories")) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("products").collect();
    if (existing.length > 0) return null;
    const { padaria, lanchonete, pizzaria, conveniencia, bebidas } = args.categoryIds;
    const products = [
      { categoryId: padaria, name: "Pão Francês", description: "Pão fresquinho assado na hora, crocante por fora e macio por dentro.", price: 0.75, imageUrl: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80", active: true, featured: true },
      { categoryId: padaria, name: "Croissant de Presunto e Queijo", description: "Croissant folhado recheado com presunto e queijo derretido.", price: 7.5, imageUrl: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=400&q=80", active: true, featured: true },
      { categoryId: padaria, name: "Pão de Queijo", description: "Pão de queijo mineiro, macio e quentinho.", price: 4.0, imageUrl: "https://images.unsplash.com/photo-1566698629409-787a68fc5724?w=400&q=80", active: true, featured: false },
      { categoryId: padaria, name: "Bolo de Cenoura com Chocolate", description: "Bolo caseiro de cenoura com cobertura de chocolate cremosa.", price: 6.0, imageUrl: "https://images.unsplash.com/photo-1546337719-5d8c8b9cb6af?w=400&q=80", active: true, featured: false },
      { categoryId: padaria, name: "Sonho Recheado", description: "Sonho frito e fofo recheado com creme de baunilha ou doce de leite.", price: 5.0, imageUrl: "https://images.unsplash.com/photo-1523294587484-bae6cc870010?w=400&q=80", active: true, featured: false },
      { categoryId: lanchonete, name: "X-Burguer Artesanal", description: "Hambúrguer artesanal 150g, queijo, alface, tomate e molho especial.", price: 22.0, imageUrl: "https://images.unsplash.com/photo-1555341483-889579a375bd?w=400&q=80", active: true, featured: true },
      { categoryId: lanchonete, name: "X-Bacon", description: "Hambúrguer, bacon crocante, queijo cheddar e molho barbecue.", price: 26.0, imageUrl: "https://images.unsplash.com/photo-1514904298838-b62571b3257d?w=400&q=80", active: true, featured: false },
      { categoryId: lanchonete, name: "Misto Quente", description: "Sanduíche de presunto e queijo grelhado na chapa.", price: 9.0, imageUrl: "https://images.unsplash.com/photo-1619708976768-50451a0b3c86?w=400&q=80", active: true, featured: false },
      { categoryId: lanchonete, name: "Batata Frita Porção", description: "Porção de batata frita crocante com molho à sua escolha.", price: 15.0, imageUrl: "https://images.unsplash.com/photo-1624981013208-bb9adbb3f7b4?w=400&q=80", active: true, featured: false },
      { categoryId: lanchonete, name: "Cachorro Quente Completo", description: "Salsicha, molho de tomate, purê de batata, milho, ervilha e mostarda.", price: 12.0, imageUrl: "https://images.unsplash.com/photo-1588258127399-549e8f09f904?w=400&q=80", active: true, featured: false },
      { categoryId: pizzaria, name: "Pizza Calabresa", description: "Molho de tomate, mussarela, calabresa fatiada e cebola.", price: 45.0, imageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&q=80", active: true, featured: true, hasSizes: true, sizes: [{ label: "Broto (4 fatias)", extraPrice: 0 }, { label: "Média (6 fatias)", extraPrice: 10 }, { label: "Grande (8 fatias)", extraPrice: 20 }] },
      { categoryId: pizzaria, name: "Pizza Margherita", description: "Molho de tomate, mussarela fresca e manjericão.", price: 42.0, imageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&q=80", active: true, featured: false, hasSizes: true, sizes: [{ label: "Broto (4 fatias)", extraPrice: 0 }, { label: "Média (6 fatias)", extraPrice: 10 }, { label: "Grande (8 fatias)", extraPrice: 20 }] },
      { categoryId: pizzaria, name: "Pizza Frango com Catupiry", description: "Frango desfiado temperado com catupiry cremoso.", price: 48.0, imageUrl: "https://images.unsplash.com/photo-1554136812-8b7875b188b2?w=400&q=80", active: true, featured: true, hasSizes: true, sizes: [{ label: "Broto (4 fatias)", extraPrice: 0 }, { label: "Média (6 fatias)", extraPrice: 10 }, { label: "Grande (8 fatias)", extraPrice: 20 }] },
      { categoryId: conveniencia, name: "Água Mineral 500ml", description: "Água mineral natural sem gás.", price: 3.0, imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80", active: true, featured: false },
      { categoryId: conveniencia, name: "Biscoito Recheado", description: "Biscoito recheado de chocolate ou baunilha.", price: 2.5, imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80", active: true, featured: false },
      { categoryId: conveniencia, name: "Chips Batata 50g", description: "Batata chips crocante, original ou temperada.", price: 4.0, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80", active: true, featured: false },
      { categoryId: bebidas, name: "Suco Natural de Laranja", description: "Suco de laranja espremido na hora, 500ml.", price: 8.0, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80", active: true, featured: true },
      { categoryId: bebidas, name: "Café Expresso", description: "Café expresso encorpado, torrado artesanalmente.", price: 4.5, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80", active: true, featured: true },
      { categoryId: bebidas, name: "Refrigerante Lata", description: "Coca-Cola, Guaraná ou Sprite gelado, 350ml.", price: 5.0, imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80", active: true, featured: false },
    ];
    for (const p of products) {
      await ctx.db.insert("products", p as Parameters<typeof ctx.db.insert<"products">>[1]);
    }
    return true;
  },
});
