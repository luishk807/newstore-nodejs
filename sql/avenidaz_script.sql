--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3
-- Dumped by pg_dump version 13.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY avenidaz.stock_entry DROP CONSTRAINT warehouse_rack_id_foreign_key;
ALTER TABLE ONLY avenidaz.stock_entry DROP CONSTRAINT warehouse_id_foreign_key;
ALTER TABLE ONLY avenidaz.warehouse_rack DROP CONSTRAINT warehouse_id_foreign_key;
ALTER TABLE ONLY avenidaz.stock_entry DROP CONSTRAINT supplier_id_foreign_key;
ALTER TABLE ONLY avenidaz.stock DROP CONSTRAINT stock_product_variant_id_fkey;
ALTER TABLE ONLY avenidaz.stock DROP CONSTRAINT stock_product_id_fkey;
ALTER TABLE ONLY avenidaz.stock_entry DROP CONSTRAINT stock_id_foreign_key;
ALTER TABLE ONLY avenidaz.product_variant DROP CONSTRAINT product_variant_product_id_fkey;
ALTER TABLE ONLY avenidaz.product_variant DROP CONSTRAINT product_variant_option_value_id_fkey;
ALTER TABLE ONLY avenidaz.product_variant DROP CONSTRAINT product_variant_option_id_fkey;
ALTER TABLE ONLY avenidaz.stock_entry DROP CONSTRAINT product_variant_id_foreign_key;
ALTER TABLE ONLY avenidaz.product_image DROP CONSTRAINT product_image_product_variant_id_fkey;
ALTER TABLE ONLY avenidaz.product_image DROP CONSTRAINT product_image_product_id_fkey;
ALTER TABLE ONLY avenidaz.brand_product DROP CONSTRAINT product_id_foreign_key;
ALTER TABLE ONLY avenidaz.stock_entry DROP CONSTRAINT product_id_foreign_key;
ALTER TABLE ONLY avenidaz.category_product DROP CONSTRAINT product_id_fkey;
ALTER TABLE ONLY avenidaz.product_discount_rule DROP CONSTRAINT product_discount_rule_product_id_fkey;
ALTER TABLE ONLY avenidaz.product_discount_rule DROP CONSTRAINT product_discount_rule_discount_rule_id_fkey;
ALTER TABLE ONLY avenidaz.product_deal DROP CONSTRAINT product_deal_product_variant_id_fkey;
ALTER TABLE ONLY avenidaz.product_deal DROP CONSTRAINT product_deal_product_id_fkey;
ALTER TABLE ONLY avenidaz.option_value DROP CONSTRAINT option_value_option_id_fkey;
ALTER TABLE ONLY avenidaz.department_product DROP CONSTRAINT department_product_product_id_fkey;
ALTER TABLE ONLY avenidaz.department_product DROP CONSTRAINT department_product_department_id_fkey;
ALTER TABLE ONLY avenidaz.category_product DROP CONSTRAINT category_id_fkey;
ALTER TABLE ONLY avenidaz.brand_product DROP CONSTRAINT brand_id_foreign_key;
DROP TRIGGER stock_update ON avenidaz.stock_entry;
ALTER TABLE ONLY avenidaz.warehouse_rack DROP CONSTRAINT warehouse_rack_pkey;
ALTER TABLE ONLY avenidaz.warehouse DROP CONSTRAINT warehouse_pkey;
ALTER TABLE ONLY avenidaz.user_account DROP CONSTRAINT user_account_pkey;
ALTER TABLE ONLY avenidaz.supplier DROP CONSTRAINT supplier_pkey;
ALTER TABLE ONLY avenidaz.stock DROP CONSTRAINT stock_pkey;
ALTER TABLE ONLY avenidaz.stock_entry DROP CONSTRAINT stock_entry_pkey;
ALTER TABLE ONLY avenidaz.product_variant DROP CONSTRAINT product_variant_pkey;
ALTER TABLE ONLY avenidaz.product DROP CONSTRAINT product_pkey;
ALTER TABLE ONLY avenidaz.option DROP CONSTRAINT product_option_pkey;
ALTER TABLE ONLY avenidaz.product_image DROP CONSTRAINT product_image_pkey;
ALTER TABLE ONLY avenidaz.product_discount_rule DROP CONSTRAINT product_discount_rules_pkey;
ALTER TABLE ONLY avenidaz.product_deal DROP CONSTRAINT product_deal_pkey;
ALTER TABLE ONLY avenidaz.option_value DROP CONSTRAINT option_value_pkey;
ALTER TABLE ONLY avenidaz.oauth_tokens DROP CONSTRAINT oauth_tokens_pkey;
ALTER TABLE ONLY avenidaz.oauth_clients DROP CONSTRAINT oauth_clients_pkey;
ALTER TABLE ONLY avenidaz.discount_rule DROP CONSTRAINT discount_rules_pkey;
ALTER TABLE ONLY avenidaz.department_product DROP CONSTRAINT department_product_pkey;
ALTER TABLE ONLY avenidaz.department DROP CONSTRAINT department_pkey;
ALTER TABLE ONLY avenidaz.category_product DROP CONSTRAINT category_product_pkey;
ALTER TABLE ONLY avenidaz.category DROP CONSTRAINT category_pkey;
ALTER TABLE ONLY avenidaz.brand_product DROP CONSTRAINT brand_product_pkey;
ALTER TABLE ONLY avenidaz.brand DROP CONSTRAINT brand_pkey;
DROP TABLE avenidaz.warehouse_rack;
DROP TABLE avenidaz.warehouse;
DROP TABLE avenidaz.user_account;
DROP TABLE avenidaz.supplier;
DROP TABLE avenidaz.stock_entry;
DROP TABLE avenidaz.stock;
DROP VIEW avenidaz.view_product;
DROP TABLE avenidaz.product_variant;
DROP TABLE avenidaz.product_image;
DROP TABLE avenidaz.product_discount_rule;
DROP TABLE avenidaz.product_deal;
DROP TABLE avenidaz.product;
DROP TABLE avenidaz.option_value;
DROP TABLE avenidaz.option;
DROP TABLE avenidaz.oauth_tokens;
DROP TABLE avenidaz.oauth_clients;
DROP TABLE avenidaz.discount_rule;
DROP TABLE avenidaz.department_product;
DROP TABLE avenidaz.department;
DROP TABLE avenidaz.category_product;
DROP TABLE avenidaz.category;
DROP TABLE avenidaz.brand_product;
DROP TABLE avenidaz.brand;
DROP FUNCTION avenidaz.new_stock_entry_update_stock();
DROP SCHEMA avenidaz;
--
-- Name: avenidaz; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA avenidaz;


--
-- Name: new_stock_entry_update_stock(); Type: FUNCTION; Schema: avenidaz; Owner: -
--

CREATE FUNCTION avenidaz.new_stock_entry_update_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN

	IF NEW.stock_id IS NULL THEN
		RAISE EXCEPTION 'stock_id cannot be null';
	END IF;
	IF NEW.warehouse_id IS NULL THEN
		RAISE EXCEPTION 'warehouse_id cannot be null';
	END IF;
	IF NEW.product_variant_id IS NULL THEN
		RAISE EXCEPTION 'product_variant_id cannot be null';
	END IF;

	IF NEW.product_variant_id > 0 AND NEW.product_variant_id < 0 THEN
		IF TG_OP = 'UPDATE' THEN
			RAISE NOTICE 'IS AN UPDATE';
			-- If it is an update, subtract the old value and add the new value
			UPDATE stock
				SET quantity = quantity - OLD.quantity + NEW.quantity
				WHERE stock_id = NEW.stock_id;
		END IF;
		IF TG_OP = 'INSERT' THEN
			RAISE NOTICE 'IS AN INSERT';
			-- If it is an insert, it will just add the new quantity
			UPDATE stock
				SET quantity = quantity + NEW.quantity
				WHERE stock_id = NEW.stock_id;
		END IF;
		IF TG_OP = 'DELETE' THEN
			RAISE NOTICE 'IS A DELETE';
			-- If it is a delete, it will subtract the quantity of the deleted record
			UPDATE stock
				SET quantity = quantity - OLD.quantity
				WHERE stock_id = OLD.stock_id;
		END IF;
	END IF;
END;
$$;


--
-- Name: FUNCTION new_stock_entry_update_stock(); Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON FUNCTION avenidaz.new_stock_entry_update_stock() IS 'Trigger that updates the stock for the product variant with the new stock_entry entry';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: brand; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.brand (
    id bigint NOT NULL,
    name character varying(50)
);


--
-- Name: TABLE brand; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON TABLE avenidaz.brand IS 'Brands of products';


--
-- Name: brand_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.brand ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.brand_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: brand_product; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.brand_product (
    brand_id bigint NOT NULL,
    product_id bigint NOT NULL
);


--
-- Name: TABLE brand_product; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON TABLE avenidaz.brand_product IS 'Brand''s products';


--
-- Name: category; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.category (
    id bigint NOT NULL,
    name character varying(50)
);


--
-- Name: category_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.category ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: category_product; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.category_product (
    category_id bigint NOT NULL,
    product_id bigint NOT NULL
);


--
-- Name: department; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.department (
    id bigint NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(100)
);


--
-- Name: department_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.department ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.department_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: department_product; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.department_product (
    department_id bigint NOT NULL,
    product_id bigint NOT NULL
);


--
-- Name: discount_rule; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.discount_rule (
    id bigint NOT NULL,
    name character varying(50) NOT NULL,
    min_quantity integer NOT NULL,
    discount_percentage numeric(3,2) NOT NULL
);


--
-- Name: TABLE discount_rule; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON TABLE avenidaz.discount_rule IS 'Discount rules';


--
-- Name: discount_rule_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.discount_rule ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.discount_rule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: oauth_clients; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.oauth_clients (
    client_id text NOT NULL,
    client_secret text NOT NULL,
    redirect_uri text NOT NULL
);


--
-- Name: oauth_tokens; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.oauth_tokens (
    id uuid NOT NULL,
    access_token text NOT NULL,
    access_token_expires_on timestamp without time zone NOT NULL,
    client_id text NOT NULL,
    refresh_token text NOT NULL,
    refresh_token_expires_on timestamp without time zone NOT NULL,
    user_account_id uuid NOT NULL
);


--
-- Name: option; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.option (
    id bigint NOT NULL,
    name character varying(20) NOT NULL,
    description character varying(100)
);


--
-- Name: TABLE option; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON TABLE avenidaz.option IS 'Product''s available options';


--
-- Name: option_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.option ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.option_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: option_value; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.option_value (
    id bigint NOT NULL,
    value character varying(30) NOT NULL,
    option_id bigint NOT NULL
);


--
-- Name: TABLE option_value; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON TABLE avenidaz.option_value IS 'Available values for the product options';


--
-- Name: option_value_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.option_value ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.option_value_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.product (
    id bigint NOT NULL,
    name character varying(50),
    description text
);


--
-- Name: product_deal; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.product_deal (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    product_variant_id bigint,
    price money,
    discount_percentage numeric(3,2),
    start_date date NOT NULL,
    end_date date NOT NULL
);


--
-- Name: TABLE product_deal; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON TABLE avenidaz.product_deal IS 'Stores deals for specific product and product variant for specific date ranges';


--
-- Name: product_deal_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.product_deal ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.product_deal_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product_discount_rule; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.product_discount_rule (
    product_id bigint NOT NULL,
    discount_rule_id bigint NOT NULL
);


--
-- Name: TABLE product_discount_rule; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON TABLE avenidaz.product_discount_rule IS 'Discount rule applied to product (not the variant)';


--
-- Name: product_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.product ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product_image; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.product_image (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    product_variant_id bigint
);


--
-- Name: TABLE product_image; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON TABLE avenidaz.product_image IS 'Product images';


--
-- Name: product_image_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.product_image ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.product_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: product_variant; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.product_variant (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    option_id bigint,
    option_value_id bigint,
    sku character varying(50) NOT NULL,
    model character varying(50)
);


--
-- Name: TABLE product_variant; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON TABLE avenidaz.product_variant IS 'Product variant defines the product specific option and its value (Shirt > Color > Red, Shirt > Size > XS)';


--
-- Name: product_variant_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.product_variant ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.product_variant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stock; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.stock (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    product_variant_id bigint
);


--
-- Name: stock_entry; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.stock_entry (
    id bigint NOT NULL,
    stock_id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    product_id bigint NOT NULL,
    warehouse_rack_id bigint,
    created_at date NOT NULL,
    unit_cost money NOT NULL,
    unit_price money NOT NULL,
    reference character varying(50),
    expiration_date date,
    product_variant_id bigint NOT NULL,
    purchase_date date,
    supplier_id bigint NOT NULL,
    quantity integer NOT NULL,
    supplier_invoice_ref character varying(50),
    deleted boolean DEFAULT false NOT NULL,
    supplier_sku character varying(50)
);


--
-- Name: COLUMN stock_entry.deleted; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON COLUMN avenidaz.stock_entry.deleted IS 'Soft delete';


--
-- Name: stock_entry_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.stock_entry ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.stock_entry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stock_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.stock ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.stock_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: supplier; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.supplier (
    id bigint NOT NULL,
    name character varying(50) NOT NULL,
    address character varying(100),
    phone character varying(20)
);


--
-- Name: supplier_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.supplier ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.supplier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_account; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.user_account (
    id uuid NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(100) NOT NULL
);


--
-- Name: view_product; Type: VIEW; Schema: avenidaz; Owner: -
--

CREATE VIEW avenidaz.view_product AS
 SELECT pv.id,
    p.id AS product_id,
    p.name,
    p.description,
    pv.sku,
    pv.model,
    b.name AS brand,
    c.name AS category,
    d.name AS department,
    o.name AS option,
    ov.value AS option_value
   FROM (((((((((avenidaz.product p
     JOIN avenidaz.product_variant pv ON ((pv.product_id = p.id)))
     LEFT JOIN avenidaz.brand_product b_p ON ((b_p.product_id = p.id)))
     LEFT JOIN avenidaz.brand b ON ((b.id = b_p.brand_id)))
     LEFT JOIN avenidaz.category_product c_p ON ((c_p.product_id = p.id)))
     LEFT JOIN avenidaz.category c ON ((c.id = c_p.category_id)))
     LEFT JOIN avenidaz.department_product d_p ON ((d_p.product_id = p.id)))
     LEFT JOIN avenidaz.department d ON ((d_p.department_id = d.id)))
     LEFT JOIN avenidaz.option o ON ((pv.option_id = o.id)))
     LEFT JOIN avenidaz.option_value ov ON ((pv.option_value_id = ov.id)));


--
-- Name: VIEW view_product; Type: COMMENT; Schema: avenidaz; Owner: -
--

COMMENT ON VIEW avenidaz.view_product IS 'Unified data for products';


--
-- Name: warehouse; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.warehouse (
    id bigint NOT NULL,
    name character varying(50),
    address character varying(100),
    phone character varying(20),
    email character varying(50)
);


--
-- Name: warehouse_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.warehouse ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.warehouse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: warehouse_rack; Type: TABLE; Schema: avenidaz; Owner: -
--

CREATE TABLE avenidaz.warehouse_rack (
    id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    name character varying(30) NOT NULL
);


--
-- Name: warehouse_rack_id_seq; Type: SEQUENCE; Schema: avenidaz; Owner: -
--

ALTER TABLE avenidaz.warehouse_rack ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME avenidaz.warehouse_rack_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: brand brand_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.brand
    ADD CONSTRAINT brand_pkey PRIMARY KEY (id);


--
-- Name: brand_product brand_product_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.brand_product
    ADD CONSTRAINT brand_product_pkey PRIMARY KEY (brand_id, product_id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: category_product category_product_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.category_product
    ADD CONSTRAINT category_product_pkey PRIMARY KEY (category_id, product_id);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: department_product department_product_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.department_product
    ADD CONSTRAINT department_product_pkey PRIMARY KEY (department_id, product_id);


--
-- Name: discount_rule discount_rules_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.discount_rule
    ADD CONSTRAINT discount_rules_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (client_id, client_secret);


--
-- Name: oauth_tokens oauth_tokens_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.oauth_tokens
    ADD CONSTRAINT oauth_tokens_pkey PRIMARY KEY (id);


--
-- Name: option_value option_value_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.option_value
    ADD CONSTRAINT option_value_pkey PRIMARY KEY (id);


--
-- Name: product_deal product_deal_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_deal
    ADD CONSTRAINT product_deal_pkey PRIMARY KEY (id);


--
-- Name: product_discount_rule product_discount_rules_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_discount_rule
    ADD CONSTRAINT product_discount_rules_pkey PRIMARY KEY (product_id, discount_rule_id);


--
-- Name: product_image product_image_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_image
    ADD CONSTRAINT product_image_pkey PRIMARY KEY (id);


--
-- Name: option product_option_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.option
    ADD CONSTRAINT product_option_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: product_variant product_variant_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_variant
    ADD CONSTRAINT product_variant_pkey PRIMARY KEY (id);


--
-- Name: stock_entry stock_entry_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.stock_entry
    ADD CONSTRAINT stock_entry_pkey PRIMARY KEY (id);


--
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);


--
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (id);


--
-- Name: warehouse warehouse_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.warehouse
    ADD CONSTRAINT warehouse_pkey PRIMARY KEY (id);


--
-- Name: warehouse_rack warehouse_rack_pkey; Type: CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.warehouse_rack
    ADD CONSTRAINT warehouse_rack_pkey PRIMARY KEY (id);


--
-- Name: stock_entry stock_update; Type: TRIGGER; Schema: avenidaz; Owner: -
--

CREATE TRIGGER stock_update AFTER INSERT OR DELETE OR UPDATE OF quantity ON avenidaz.stock_entry FOR EACH ROW EXECUTE FUNCTION avenidaz.new_stock_entry_update_stock();


--
-- Name: brand_product brand_id_foreign_key; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.brand_product
    ADD CONSTRAINT brand_id_foreign_key FOREIGN KEY (brand_id) REFERENCES avenidaz.brand(id) NOT VALID;


--
-- Name: category_product category_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.category_product
    ADD CONSTRAINT category_id_fkey FOREIGN KEY (category_id) REFERENCES avenidaz.category(id) NOT VALID;


--
-- Name: department_product department_product_department_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.department_product
    ADD CONSTRAINT department_product_department_id_fkey FOREIGN KEY (department_id) REFERENCES avenidaz.department(id);


--
-- Name: department_product department_product_product_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.department_product
    ADD CONSTRAINT department_product_product_id_fkey FOREIGN KEY (product_id) REFERENCES avenidaz.product(id);


--
-- Name: option_value option_value_option_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.option_value
    ADD CONSTRAINT option_value_option_id_fkey FOREIGN KEY (option_id) REFERENCES avenidaz.option(id) NOT VALID;


--
-- Name: product_deal product_deal_product_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_deal
    ADD CONSTRAINT product_deal_product_id_fkey FOREIGN KEY (product_id) REFERENCES avenidaz.product(id);


--
-- Name: product_deal product_deal_product_variant_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_deal
    ADD CONSTRAINT product_deal_product_variant_id_fkey FOREIGN KEY (product_variant_id) REFERENCES avenidaz.product_variant(id);


--
-- Name: product_discount_rule product_discount_rule_discount_rule_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_discount_rule
    ADD CONSTRAINT product_discount_rule_discount_rule_id_fkey FOREIGN KEY (discount_rule_id) REFERENCES avenidaz.discount_rule(id) NOT VALID;


--
-- Name: product_discount_rule product_discount_rule_product_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_discount_rule
    ADD CONSTRAINT product_discount_rule_product_id_fkey FOREIGN KEY (product_id) REFERENCES avenidaz.product(id) NOT VALID;


--
-- Name: category_product product_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.category_product
    ADD CONSTRAINT product_id_fkey FOREIGN KEY (product_id) REFERENCES avenidaz.product(id) NOT VALID;


--
-- Name: stock_entry product_id_foreign_key; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.stock_entry
    ADD CONSTRAINT product_id_foreign_key FOREIGN KEY (product_id) REFERENCES avenidaz.product(id);


--
-- Name: brand_product product_id_foreign_key; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.brand_product
    ADD CONSTRAINT product_id_foreign_key FOREIGN KEY (product_id) REFERENCES avenidaz.product(id) NOT VALID;


--
-- Name: product_image product_image_product_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_image
    ADD CONSTRAINT product_image_product_id_fkey FOREIGN KEY (product_id) REFERENCES avenidaz.product(id);


--
-- Name: product_image product_image_product_variant_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_image
    ADD CONSTRAINT product_image_product_variant_id_fkey FOREIGN KEY (product_variant_id) REFERENCES avenidaz.product_variant(id);


--
-- Name: stock_entry product_variant_id_foreign_key; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.stock_entry
    ADD CONSTRAINT product_variant_id_foreign_key FOREIGN KEY (product_variant_id) REFERENCES avenidaz.product_variant(id);


--
-- Name: product_variant product_variant_option_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_variant
    ADD CONSTRAINT product_variant_option_id_fkey FOREIGN KEY (option_id) REFERENCES avenidaz.option(id) NOT VALID;


--
-- Name: product_variant product_variant_option_value_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_variant
    ADD CONSTRAINT product_variant_option_value_id_fkey FOREIGN KEY (option_value_id) REFERENCES avenidaz.option_value(id) NOT VALID;


--
-- Name: product_variant product_variant_product_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.product_variant
    ADD CONSTRAINT product_variant_product_id_fkey FOREIGN KEY (product_id) REFERENCES avenidaz.product(id) NOT VALID;


--
-- Name: stock_entry stock_id_foreign_key; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.stock_entry
    ADD CONSTRAINT stock_id_foreign_key FOREIGN KEY (stock_id) REFERENCES avenidaz.stock(id);


--
-- Name: stock stock_product_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.stock
    ADD CONSTRAINT stock_product_id_fkey FOREIGN KEY (product_id) REFERENCES avenidaz.product(id) NOT VALID;


--
-- Name: stock stock_product_variant_id_fkey; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.stock
    ADD CONSTRAINT stock_product_variant_id_fkey FOREIGN KEY (product_variant_id) REFERENCES avenidaz.product_variant(id) NOT VALID;


--
-- Name: stock_entry supplier_id_foreign_key; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.stock_entry
    ADD CONSTRAINT supplier_id_foreign_key FOREIGN KEY (supplier_id) REFERENCES avenidaz.supplier(id) NOT VALID;


--
-- Name: warehouse_rack warehouse_id_foreign_key; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.warehouse_rack
    ADD CONSTRAINT warehouse_id_foreign_key FOREIGN KEY (warehouse_id) REFERENCES avenidaz.warehouse(id);


--
-- Name: stock_entry warehouse_id_foreign_key; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.stock_entry
    ADD CONSTRAINT warehouse_id_foreign_key FOREIGN KEY (warehouse_id) REFERENCES avenidaz.warehouse(id);


--
-- Name: stock_entry warehouse_rack_id_foreign_key; Type: FK CONSTRAINT; Schema: avenidaz; Owner: -
--

ALTER TABLE ONLY avenidaz.stock_entry
    ADD CONSTRAINT warehouse_rack_id_foreign_key FOREIGN KEY (warehouse_rack_id) REFERENCES avenidaz.warehouse_rack(id) NOT VALID;


--
-- PostgreSQL database dump complete
--

