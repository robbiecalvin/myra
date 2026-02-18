import { parse } from "csv-parse/sync";
import { dbPool } from "../db/pool.js";

type CsvRow = {
  product_name: string;
  category: string;
  price: string;
  in_stock: string;
};

type InventoryRow = {
  productName: string;
  category: string;
  price: number;
  inStock: boolean;
};

const toBoolean = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y", "in_stock", "instock"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "n", "out_of_stock", "outofstock"].includes(normalized)) {
    return false;
  }
  throw new Error(`Invalid in_stock value: ${value}`);
};

const parseCsv = (content: string): InventoryRow[] => {
  const parsed = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as CsvRow[];

  if (!parsed.length) {
    throw new Error("CSV file is empty.");
  }

  return parsed.map((row, index) => {
    const line = index + 2;
    if (!row.product_name?.trim()) {
      throw new Error(`Missing product_name at line ${line}`);
    }
    if (!row.category?.trim()) {
      throw new Error(`Missing category at line ${line}`);
    }

    const price = Number.parseFloat(row.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Invalid price at line ${line}`);
    }

    return {
      productName: row.product_name.trim(),
      category: row.category.trim(),
      price: Number(price.toFixed(2)),
      inStock: toBoolean(row.in_stock)
    };
  });
};

export const replaceInventoryFromCsv = async (storeId: string, content: string): Promise<{ replaced: number }> => {
  const records = parseCsv(content);

  const pool = dbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM store_inventory WHERE store_id = $1", [storeId]);

    for (const row of records) {
      await client.query(
        `INSERT INTO store_inventory (store_id, product_name, category, price, in_stock)
         VALUES ($1, $2, $3, $4, $5)`,
        [storeId, row.productName, row.category, row.price, row.inStock]
      );
    }

    await client.query("COMMIT");
    return { replaced: records.length };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
