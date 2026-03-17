export interface OrderItem {
  id: string;
  n: number;
  product: string;
  description: string;
  unitValue: number | string; // Suporta entrada visual '4,50'
  quantity: number | string;  // Suporta entrada visual '1'
  total: number;
}

export interface ClientData {
  name: string;
  doc: string;
  phone: string;
  email: string;
  rua: string;
  bairro: string;
  cidade: string;
}

export interface OrderState {
  orderNumber: string;
  orderDate: string;
  client: ClientData;
  items: OrderItem[];
  discount: number | string;
  observations: string;
}
