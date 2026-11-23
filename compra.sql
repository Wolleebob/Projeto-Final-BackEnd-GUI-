CREATE TABLE compra_produto (
  compra_id      INT           NOT NULL,
  produto_id     INT           NOT NULL,
  sabor_id       INT           NOT NULL,
  quantidade     INT           NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,

  PRIMARY KEY (compra_id, produto_id, sabor_id),

  CONSTRAINT fk_cp_compra
    FOREIGN KEY (compra_id) REFERENCES compra(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_cp_produto
    FOREIGN KEY (produto_id) REFERENCES produto(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_cp_sabor
    FOREIGN KEY (sabor_id) REFERENCES sabores_sorvete(id)
    ON DELETE RESTRICT
);