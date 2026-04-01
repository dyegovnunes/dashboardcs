import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES_PROMPT = `Você é um classificador de respostas de pesquisa NPS de uma instituição de ensino superior.

Para cada resposta, retorne a categoria e subcategoria mais adequada usando EXATAMENTE os valores abaixo.

Categorias e subcategorias válidas:
- Acadêmico: Metodologia, Quantidade de Conteúdo, Formato de Conteúdo, Qualidade do Conteúdo, Professor, Coordenador, Tutor, Problemas com datas, Avaliações, Projeto Integrador, Matriz Curricular
- Atendimento: Demora no Atendimento, Falta de Suporte, Qualidade do Atendimento, Falta de Retorno, Falta de Resolução
- Comercial: Discurso de venda
- Produto: Modalidade EaD, Oferta, Falta de personalização, Desorganização, Plataforma e tecnologias, Estrutura EaD x Presencial, Precisa ir presencialmente
- Comunicações: Falta de comunicações, Excesso de comunicações
- Operações (Serviços): Aproveitamento de Disciplinas, Documentação, Formatura, Financeiro, Secretaria, Rematrícula
- IES: Estrutura física, Polo, Necessidade de deslocamento para atendimento
- Irrelevante: Irrelevante (comentário sem relevância para análise, como "nada", "ok", números soltos)
- Positivo: Positivo (resposta que elogia a instituição, mesmo sendo de detrator)

Regras:
- Se a resposta é claramente positiva/elogiosa, classifique como Positivo/Positivo
- Se a resposta não tem conteúdo relevante, classifique como Irrelevante/Irrelevante
- NUNCA invente categorias ou subcategorias fora da lista acima`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json() as { answers: { id: string; text: string }[] };

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return new Response(JSON.stringify({ error: "No answers provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userContent = answers
      .map((a, i) => `[${i}] id=${a.id}: "${a.text}"`)
      .join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: CATEGORIES_PROMPT },
          { role: "user", content: `Classifique cada resposta abaixo:\n\n${userContent}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_answers",
              description: "Classifica as respostas NPS em categorias e subcategorias",
              parameters: {
                type: "object",
                properties: {
                  classifications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "ID da resposta" },
                        categoria: { type: "string" },
                        subcategoria: { type: "string" },
                      },
                      required: ["id", "categoria", "subcategoria"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["classifications"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_answers" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ classifications: parsed.classifications }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-nps error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
