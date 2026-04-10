<div align="center">
  <img width="1200" height="475" alt="Wigoo Executive Dashboard" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <h1>Wigoo Digital Intelligence Hub</h1>
  <p><strong>Executive Dashboard · Performance & Creative Analysis</strong></p>
</div>

---

## Sumário

- [Visão Geral](#visão-geral)
- [Instalação e Execução Local](#instalação-e-execução-local)
- [Modos de Entrada de Dados](#modos-de-entrada-de-dados)
  - [Conexão Live (API Power BI)](#conexão-live-api-power-bi)
  - [Export Manual (Copiar/Colar)](#export-manual-copiacolar)
- [Formato de Export: Performance](#formato-de-export-performance)
- [Formato de Export: Criativos](#formato-de-export-criativos)
  - [Estrutura do Export CREATIVE](#estrutura-do-export-creative)
  - [Campos por Criativo](#campos-por-criativo)
  - [Regras de URL de Imagem](#regras-de-url-de-imagem)
  - [Como obter URLs válidas do Power BI](#como-obter-urls-válidas-do-power-bi)
- [DAX Template para Criativos](#dax-template-para-criativos)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Problemas Comuns](#problemas-comuns)

---

## Visão Geral

O Wigoo Digital Intelligence Hub é um dashboard executivo de marketing digital que combina:

- **Análise de Performance** — investimento, conversões, ROAS, CPA, comparativo YoY e MoM por plataforma (Meta, Google, TikTok, Awin, etc.)
- **Análise de Criativos** — galeria de anúncios com score Wigoo AI, diagnóstico e recomendações geradas por IA (Gemini/GPT-4)
- **Conexão Live** — consulta direta ao Power BI via API REST sem copiar/colar
- **Export PDF** — relatório executivo para apresentação ao cliente

---

## Instalação e Execução Local

**Pré-requisitos:** Node.js 18+

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as chaves de API

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build de produção
npm run build
```

---

## Modos de Entrada de Dados

O dashboard aceita dois modos de entrada, selecionáveis pela aba no topo:

### Conexão Live (API Power BI)

Consulta automática ao dataset Power BI configurado no `config/clients.ts`. Basta selecionar o cliente, o período e clicar em **Sincronizar**. As DAX queries estão pré-configuradas por cliente.

### Export Manual (Copiar/Colar)

Ideal para testes, apresentações offline ou quando a conexão Live não está disponível. Cole a string de export no campo de texto e clique em **Processar**.

---

## Formato de Export: Performance

Para o modo **Performance**, a string deve conter um dos seguintes marcadores:

- `_EXPORT_` — export padrão YoY
- `EXPORT_YOY` — export Year-over-Year explícito
- `EXPORT_MOM` — export Month-over-Month
- `EXPORT_C&A` — export customizado C&A

**Exemplo resumido:**
```
EXPORT_YOY;;periodo_inicio=01/03/2026;;periodo_fim=31/03/2026;;investimento=atual=125430|anterior=98200|var=+27.7%;;receita=atual=890000|anterior=720000|var=+23.6%;;...
```

---

## Formato de Export: Criativos

### Estrutura do Export CREATIVE

O marcador obrigatório é `EXPORT_CREATIVOS_FULL_MOM`. A string segue o padrão:

```
EXPORT_CREATIVOS_FULL_MOM;;periodo_inicio=DD/MM/YYYY;;periodo_fim=DD/MM/YYYY;;detalhamento_criativos=CRIATIVO_1||CRIATIVO_2||CRIATIVO_3
```

**Separadores:**
| Nível | Separador |
|---|---|
| Campos globais | `;;` |
| Entre criativos | `\|\|` (dois pipes, sem espaço) |
| Entre campos de um criativo | ` \| ` (espaço-pipe-espaço) |
| Chave e valor de cada campo | `:` |

### Campos por Criativo

| Campo | Descrição | Obrigatório |
|---|---|---|
| `n` | Nome do anúncio (ad_name) | Sim |
| `i` | Investimento (spend) — ponto como decimal | Sim |
| `i_ant` | Investimento período anterior | Não |
| `im` | Impressões | Sim |
| `im_ant` | Impressões período anterior | Não |
| `cl` | Cliques (link clicks) | Sim |
| `cl_ant` | Cliques período anterior | Não |
| `co` | Conversões | Não |
| `co_ant` | Conversões período anterior | Não |
| `re` | Receita | Não |
| `re_ant` | Receita período anterior | Não |
| `roas` | ROAS | Não |
| `cpa` | CPA | Não |
| `dif_criativo` | Dias ativos | Não |
| `url` | URL completa da imagem do criativo | Sim |

> O campo `url` deve ser **sempre o último campo** de cada criativo, pois o parser extrai tudo após `url:` até o fim do bloco.

### Regras de URL de Imagem

O parser aceita URLs que contenham qualquer um destes padrões:

| Padrão | Origem | Funciona sem auth? |
|---|---|---|
| `.jpg`, `.jpeg`, `.png`, `.webp` | URLs diretas de imagem | Sim |
| `scontent*.fbcdn.net` | CDN privado do Meta | **Não** — exige cookies de login do Facebook |
| `external-*.fbcdn.net/emg1/` | CDN público do Meta | **Sim** — funciona sem autenticação |
| `fbcdn.net` (qualquer subdomínio emg) | CDN público do Meta | **Sim** |

> **Regra crítica:** Sempre use URLs do tipo `external-*.xx.fbcdn.net/emg1/...` para que as imagens carreguem no browser sem login. URLs `scontent-*` exigem sessão ativa do Facebook e mostrarão imagem genérica (fallback) para usuários não logados.

### Como obter URLs válidas do Power BI

Execute esta DAX no seu dataset para obter URLs do CDN público (`external-*`):

```dax
EVALUATE
TOPN(20,
  FILTER(
    SELECTCOLUMNS(
      'facebook_ads_DETAILS_<cliente>',
      "ad_id",   'facebook_ads_DETAILS_<cliente>'[ad_id],
      "thumb",   'facebook_ads_DETAILS_<cliente>'[creative_thumbnail_url]
    ),
    CONTAINSSTRING([thumb], "external-")
    && NOT(CONTAINSSTRING([thumb], "share_arrow"))
  ),
  [ad_id], DESC
)
```

> Filtre sempre por `CONTAINSSTRING([thumb], "external-")` e exclua `share_arrow.gif` (ícone genérico do Facebook). Nem todos os anúncios têm URL pública — quando não houver `external-`, o criativo não será exibido no modo manual.

---

## DAX Template para Criativos

Use este template no **Power BI DAX** para gerar a string de export no formato correto:

```dax
DEFINE
  MEASURE 'Medidas'[Wigoo_Creative_Export] =
    VAR _criativos =
      CONCATENATEX(
        TOPN(
          10,
          FILTER(
            ADDCOLUMNS(
              SUMMARIZE(
                'facebook_ads_serasa_pme',
                'facebook_ads_serasa_pme'[ad_id],
                'facebook_ads_serasa_pme'[ad_name]
              ),
              "spend",       CALCULATE(SUM('facebook_ads_serasa_pme'[spend])),
              "impr",        CALCULATE(SUM('facebook_ads_serasa_pme'[impressions])),
              "clks",        CALCULATE(SUM('facebook_ads_serasa_pme'[clicks])),
              "thumb_url",   LOOKUPVALUE(
                               'facebook_ads_DETAILS_serasa_pme'[creative_thumbnail_url],
                               'facebook_ads_DETAILS_serasa_pme'[ad_id],
                               'facebook_ads_serasa_pme'[ad_id]
                             )
            ),
            CONTAINSSTRING([thumb_url], "external-")
            && NOT(CONTAINSSTRING([thumb_url], "share_arrow"))
          ),
          [spend], DESC
        ),
        "n:" & 'facebook_ads_serasa_pme'[ad_name]
          & " | i:" & FORMAT([spend], "0.00")
          & " | im:" & FORMAT([impr], "0")
          & " | cl:" & FORMAT([clks], "0")
          & " | co:0 | re:0 | roas:0 | cpa:0"
          & " | url:" & [thumb_url],
        "||"
      )
  RETURN
    "EXPORT_CREATIVOS_FULL_MOM"
    & ";;periodo_inicio={{START_DATE_FORMATTED}}"
    & ";;periodo_fim={{END_DATE_FORMATTED}}"
    & ";;detalhamento_criativos=" & _criativos

EVALUATE
  CALCULATETABLE(
    ROW("Result", 'Medidas'[Wigoo_Creative_Export]),
    'dCalendario'[Date] >= {{START_DATE_DAX}},
    'dCalendario'[Date] <= {{END_DATE_DAX}}
  )
```

> Os placeholders `{{START_DATE_FORMATTED}}`, `{{END_DATE_DAX}}` etc. são substituídos automaticamente pelo `services/powerbi.ts` quando usada a Conexão Live. Para export manual, substitua manualmente pelas datas desejadas.

---

## Exemplo Completo de Export Manual (Criativos)

```
EXPORT_CREATIVOS_FULL_MOM;;periodo_inicio=01/01/2026;;periodo_fim=10/04/2026;;detalhamento_criativos=n:pe002403_ds-mes-consumidor_compra_base_refresh-v5-meta | i:4135.89 | im:441019 | cl:6011 | co:0 | re:0 | roas:0 | cpa:0 | dif_criativo:8 | url:https://external-iad3-1.xx.fbcdn.net/emg1/v/t13/4663080427518319979?url=https%3A%2F%2Fwww.facebook.com%2Fads%2Fimage%2F%3Fd%3DAQKO22CWj1u1_m8EQOhqdRlvRHHWnHqVYqsiY-NN-eyMhjCFcm5aVP2ruZepP94Knn8xTl7PJh4Fi7pgCb3u2if06QIuDD5IX-oqXoVWuaGVt5xTd9IX-PdGsLXJZhxoAbFGjAoSjUiYAOjTDEhZ9j8E&fb_obo=1&utld=facebook.com&stp=c0.5000x0.5000f_dst-emg0_p15000x15000_q75_tt6&edm=AOgd6ZUEAAAA&_nc_gid=zbwP2RYBNWh3Ha_bz2p8Ug&_nc_eui2=AeHd7cfvm2mK5rDHzP6Il-VjXDOVRCVn3WVcM5VEJWfdZWYFxvsLARJmaP4Y19FfEFoIGUtweJj8MDIwEB2dAPo9&_nc_oc=Adrme53y1dMVBmdL0UK55O4cZYsflLXErSO54DvZPSoF6pDwgkbcip0iUvqNq0GCTII&ccb=13-1&oh=06_Q3--AZYOsQCAIbMlHjswlDx--8CbL7DN18BL8UWRmvyP3UJy&oe=69DA6707&_nc_sid=58080a||n:pe000377_pme_consulta_calculadora_score-lp-carrossel | i:1977.81 | im:693662 | cl:5774 | co:0 | re:0 | roas:0 | cpa:0 | dif_criativo:618 | url:https://external-iad3-1.xx.fbcdn.net/emg1/v/t13/4778167970348242468?url=https%3A%2F%2Fwww.facebook.com%2Fads%2Fimage%2F%3Fd%3DAQJuUtlcV1jpRjgyTgjc0oIVhD_ICHrIETxbHSmKXiPxX1OAhS2TmAp6WS_htYFs9krdjz0fbpuD8GkWN96Nm2S7wT6Du-1VvMqTHjMWym5FNV6ldhQ4TRJgEovaqgA2xHzkWlDp1dODZmAugEySqnlG&fb_obo=1&utld=facebook.com&stp=c0.5000x0.5000f_dst-emg0_p15000x15000_q75_tt6&edm=AOgd6ZUEAAAA&_nc_gid=r-aCpvADlb0JXJiVGL2UkA&_nc_eui2=AeFW0oPM0-xjGvTgtzhNUPX9BZARheRw0g4FkBGF5HDSDpULnvkeGhsAaIUONZ7rTNdcsnx-r1dVsykwMMSxUerd&_nc_oc=AdoJI0e89o23KK-UAi07DHNjB_hsPXxMMFWzhEtWzLCdiHlGnmSJmY4q4VXcfdR5TQU&ccb=13-1&oh=06_Q3--AZI_MZfqi2wX2RSQ0zdJuv3MibVfyIPoevD06yZb9fkm&oe=69DA6983&_nc_sid=58080a
```

> **Atenção:** Nunca truncar a URL. O parâmetro `oh=` é o hash de autenticação do CDN — sem ele o Meta retorna 403 e a imagem não carrega.

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# IA — ao menos uma das duas chaves é necessária
VITE_GEMINI_API_KEY=sua_chave_gemini_aqui
VITE_OPENAI_API_KEY=sua_chave_openai_aqui

# Power BI Live Connection (opcional — necessário apenas para o modo Live)
# A autenticação é feita via Microsoft OAuth no painel de configurações
```

As chaves de IA são usadas em cascata: Gemini → OpenAI (fallback) → Groq (fallback).

---

## Variáveis de Ambiente na Vercel

Na Vercel, configure as mesmas variáveis em **Settings → Environment Variables**:

| Variável | Valor |
|---|---|
| `VITE_GEMINI_API_KEY` | Chave do Google AI Studio |
| `VITE_OPENAI_API_KEY` | Chave da OpenAI |

---

## Problemas Comuns

### "Formato de exportação não identificado ou inválido"
A string não contém nenhum dos marcadores reconhecidos pelo parser. Para criativos, use `EXPORT_CREATIVOS_FULL_MOM`. Para performance, use `EXPORT_YOY`, `EXPORT_MOM` ou `_EXPORT_`.

### Imagens aparecem como genéricas/borradas
Causas mais comuns:
1. **URL `scontent-*`** — requer login do Facebook. Use apenas URLs `external-*.fbcdn.net/emg1/`.
2. **URL truncada** — o parâmetro `oh=` foi cortado. Sempre use a URL completa retornada pelo Power BI.
3. **URL expirada** — o parâmetro `oe=` é um timestamp Unix em hex. URLs do Meta expiram. Gere um novo export.

### "AGUARDANDO ANÁLISE AI" em todos os criativos
A IA analisa em fila. Se nenhum criativo iniciar análise, verifique se as chaves `VITE_GEMINI_API_KEY` ou `VITE_OPENAI_API_KEY` estão configuradas corretamente.

### Análise AI retorna erro de API
Verifique o console do browser. O sistema tenta Gemini → OpenAI → Groq em sequência. Se todas as chaves falharem, a análise não será concluída.

---

<div align="center">
  <p>© 2026 Wigoo Digital Marketing — Estratégia e Tecnologia</p>
  <p><em>Documento Interno · Uso Exclusivo Wigoo & Parceiros</em></p>
</div>
