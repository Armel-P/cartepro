--
-- PostgreSQL database dump
--

\restrict sxI6GFqMrUZeaWFCqHAHCafKN5f678eAOg6XMKQFb5bqNmLkIhkft64S8bmKBOy

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: cartepro
--

CREATE TABLE public.admin (
    id uuid NOT NULL
);


ALTER TABLE public.admin OWNER TO cartepro;

--
-- Name: employee; Type: TABLE; Schema: public; Owner: cartepro
--

CREATE TABLE public.employee (
    id uuid NOT NULL,
    balance real,
    qr_token character varying(255),
    qr_token_created_at bigint
);


ALTER TABLE public.employee OWNER TO cartepro;

--
-- Name: partner; Type: TABLE; Schema: public; Owner: cartepro
-- --

CREATE TABLE public.partner (
    id uuid NOT NULL,
    coordinate point,
    siren integer,
    social_obj character varying(255),
    verification boolean,
    category character varying(255)
);


ALTER TABLE public.partner OWNER TO cartepro;

--
-- Name: state; Type: TABLE; Schema: public; Owner: cartepro
--

CREATE TABLE public.state (
    id uuid NOT NULL,
    state character varying(32) NOT NULL,
    reason character varying(255),
    modified_at bigint NOT NULL
);


ALTER TABLE public.state OWNER TO cartepro;

--
-- Name: transaction; Type: TABLE; Schema: public; Owner: cartepro
--

CREATE TABLE public.transaction (
    id uuid NOT NULL,
    "timestamp" bigint NOT NULL,
    success boolean,
    value real,
    partner_id uuid,
    employee_id uuid
);


ALTER TABLE public.transaction OWNER TO cartepro;

--
-- Name: users; Type: TABLE; Schema: public; Owner: cartepro
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    mail character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password text NOT NULL,
    role character varying(32) NOT NULL,
    created_at bigint NOT NULL
);


ALTER TABLE public.users OWNER TO cartepro;

--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);


--
-- Name: employee employee_pkey; Type: CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_pkey PRIMARY KEY (id);


--
-- Name: partner partner_pkey; Type: CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.partner
    ADD CONSTRAINT partner_pkey PRIMARY KEY (id);


--
-- Name: partner partner_siren_key; Type: CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.partner
    ADD CONSTRAINT partner_siren_key UNIQUE (siren);


--
-- Name: state state_pkey; Type: CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.state
    ADD CONSTRAINT state_pkey PRIMARY KEY (id);


--
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (id);


--
-- Name: users users_mail_key; Type: CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_mail_key UNIQUE (mail);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: admin admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- Name: employee employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- Name: partner partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.partner
    ADD CONSTRAINT partner_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- Name: state state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.state
    ADD CONSTRAINT state_id_fkey FOREIGN KEY (id) REFERENCES public.users(id);


--
-- Name: transaction transaction_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employee(id);


--
-- Name: transaction transaction_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cartepro
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partner(id);


--
-- PostgreSQL database dump complete
--

\unrestrict sxI6GFqMrUZeaWFCqHAHCafKN5f678eAOg6XMKQFb5bqNmLkIhkft64S8bmKBOy

