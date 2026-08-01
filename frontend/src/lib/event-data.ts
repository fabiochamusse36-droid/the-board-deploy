// Centralized mock data for THE BOARD forum.
// All UI-facing reads must go through services/hooks — never import this directly from components.

export type TicketRaw = {
  id: string;
  name: string;
  price_mt: number;
  description: string;
  tag: string;
  seats: string;
  featured?: boolean;
  available: boolean;
};

export type ScheduleItemRaw = {
  time: string;
  title: string;
  description: string;
};

export type SponsorTierRaw = {
  id: string;
  tier: string;
  price_mt: number;
  slots: string;
  perks: string[];
  highlight?: boolean;
};

export type KpiRaw = { value: string; label: string };

export const TICKETS_DATA: TicketRaw[] = [
  { id: "early-investors", name: "Investidores Iniciais", price_mt: 2500, description: "Acesso geral antecipado", tag: "Lote 1", seats: "50 lugares", available: true },
  { id: "executive-access", name: "Executive Access", price_mt: 3500, description: "Acesso geral padrão", tag: "Lote 2", seats: "100 lugares", available: false },
  { id: "last-call", name: "Last Call", price_mt: 5000, description: "Acesso geral de última hora", tag: "Lote 3", seats: "30 lugares", available: false },
  { id: "vip-board", name: "VIP Board Member", price_mt: 7500, description: "Lounge exclusivo + jantar premium", tag: "VIP", seats: "20 lugares", featured: true, available: true },
  { id: "streaming-premium", name: "Streaming Premium", price_mt: 1500, description: "Acesso digital global", tag: "Online", seats: "Ilimitado", available: false },
];

export const SCHEDULE_DATA: ScheduleItemRaw[] = [
  { time: "08:30", title: "Recepção Executiva & Credenciamento", description: "Entrega de credenciais premium no Foyer." },
  { time: "09:00", title: "Cerimónia Oficial de Abertura", description: "Contextualização macroeconómica do fórum." },
  { time: "09:10", title: "Painel I — The Market Makers", description: "Fluxos institucionais e fronteiras regionais." },
  { time: "10:10", title: "Painel II — Capital & Escala", description: "Alocação avançada e ativos reais." },
  { time: "11:00", title: "Power Networking Coffee", description: "Marketplace com facilitação comercial." },
  { time: "11:40", title: "The Boardroom Session", description: "Mesa redonda consultiva e fechada." },
  { time: "12:45", title: "Encerramento Oficial", description: "Notas finais e balanço de indicadores." },
];

export const SPONSOR_TIERS_DATA: SponsorTierRaw[] = [
  {
    id: "master",
    tier: "MASTER",
    price_mt: 300000,
    slots: "1 cota — exclusividade de setor",
    perks: ["Naming Partner do evento", "Keynote institucional de abertura", "Stand premium de 1ª linha", "10 bilhetes VIP Board Member", "Destaque em todas as campanhas"],
    highlight: true,
  },
  {
    id: "gold",
    tier: "GOLD",
    price_mt: 150000,
    slots: "2 cotas disponíveis",
    perks: ["Logótipo em backdrops oficiais", "Stand dedicado no Marketplace", "6 bilhetes VIP Board Member", "Menções pelo Mestre de Cerimónias"],
  },
  {
    id: "silver",
    tier: "SILVER",
    price_mt: 75000,
    slots: "3 cotas disponíveis",
    perks: ["Logótipo em materiais oficiais", "4 bilhetes VIP Board Member", "Carrossel em redes sociais oficiais"],
  },
];

export const KPIS_DATA: KpiRaw[] = [
  { value: "200", label: "Participantes presenciais" },
  { value: "10K+", label: "Alcance digital estimado" },
  { value: "05", label: "Parceiros estratégicos" },
  { value: "2M+", label: "Faturação alvo (MT)" },
  { value: "90%+", label: "Taxa de satisfação" },
];
