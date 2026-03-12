export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      atividades: {
        Row: {
          created_at: string
          data: string
          descricao: string
          gleba_id: string | null
          id: string
          responsavel_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          descricao: string
          gleba_id?: string | null
          id?: string
          responsavel_id: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          gleba_id?: string | null
          id?: string
          responsavel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_gleba_id_fkey"
            columns: ["gleba_id"]
            isOneToOne: false
            referencedRelation: "glebas"
            referencedColumns: ["id"]
          },
        ]
      }
      cidades: {
        Row: {
          codigo_ibge: number | null
          created_at: string
          id: string
          nome: string
          planos_diretores: string[] | null
          populacao: number | null
          updated_at: string
        }
        Insert: {
          codigo_ibge?: number | null
          created_at?: string
          id?: string
          nome: string
          planos_diretores?: string[] | null
          populacao?: number | null
          updated_at?: string
        }
        Update: {
          codigo_ibge?: number | null
          created_at?: string
          id?: string
          nome?: string
          planos_diretores?: string[] | null
          populacao?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      comercial_corretores: {
        Row: {
          bairro: string
          cep: string
          cidade: string
          cnpj: string | null
          cpf: string | null
          creci: string
          email: string
          endereco: string
          id: string
          nome: string
          telefone: string
          tipo: string
          uf: string
        }
        Insert: {
          bairro: string
          cep: string
          cidade: string
          cnpj?: string | null
          cpf?: string | null
          creci: string
          email: string
          endereco: string
          id?: string
          nome: string
          telefone: string
          tipo: string
          uf: string
        }
        Update: {
          bairro?: string
          cep?: string
          cidade?: string
          cnpj?: string | null
          cpf?: string | null
          creci?: string
          email?: string
          endereco?: string
          id?: string
          nome?: string
          telefone?: string
          tipo?: string
          uf?: string
        }
        Relationships: []
      }
      comercial_dados_bancarios: {
        Row: {
          dados_bancarios: string
          empreendimento: string
          id: string
        }
        Insert: {
          dados_bancarios: string
          empreendimento: string
          id?: string
        }
        Update: {
          dados_bancarios?: string
          empreendimento?: string
          id?: string
        }
        Relationships: []
      }
      comercial_lotes_detalhes: {
        Row: {
          area: number
          empreendimento: string
          id: string
          matricula: number
          num_lote: string
          onus: string
        }
        Insert: {
          area: number
          empreendimento: string
          id?: string
          matricula: number
          num_lote: string
          onus?: string
        }
        Update: {
          area?: number
          empreendimento?: string
          id?: string
          matricula?: number
          num_lote?: string
          onus?: string
        }
        Relationships: []
      }
      comercial_tabela_precos: {
        Row: {
          created_at: string | null
          data_preco: string | null
          empreendimento: string | null
          id: number
          juros: number | null
          num_lote: string | null
          preco_av: number | null
        }
        Insert: {
          created_at?: string | null
          data_preco?: string | null
          empreendimento?: string | null
          id: number
          juros?: number | null
          num_lote?: string | null
          preco_av?: number | null
        }
        Update: {
          created_at?: string | null
          data_preco?: string | null
          empreendimento?: string | null
          id?: number
          juros?: number | null
          num_lote?: string | null
          preco_av?: number | null
        }
        Relationships: []
      }
      comercial_templates_contratos: {
        Row: {
          empreendimento: string
          id: string
          id_doc_aprazo: string
          id_doc_avista: string
        }
        Insert: {
          empreendimento: string
          id?: string
          id_doc_aprazo: string
          id_doc_avista: string
        }
        Update: {
          empreendimento?: string
          id?: string
          id_doc_aprazo?: string
          id_doc_avista?: string
        }
        Relationships: []
      }
      crm_deal_images: {
        Row: {
          deal_id: string
          id: string
          image_url: string
          nome_arquivo: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          deal_id: string
          id?: string
          image_url: string
          nome_arquivo?: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          deal_id?: string
          id?: string
          image_url?: string
          nome_arquivo?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_images_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_phones: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          telefone: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          telefone: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_phones_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          cidade_cliente: string | null
          cliente_email: string | null
          cliente_nome: string
          created_at: string
          data_nascimento: string | null
          empreendimento_id: string | null
          escolaridade: string | null
          estado_civil: string | null
          filhos: string | null
          fonte_id: string | null
          forma_pagamento: string | null
          id: string
          interesse: string | null
          interesses_pessoais: string[] | null
          link_contrato: string | null
          logradouro: string | null
          motivo_perda_id: string | null
          nacionalidade: string | null
          numero_logradouro: string | null
          numero_lote: string | null
          ordem_kanban: number
          preco_lote: number | null
          qualificacao: Database["public"]["Enums"]["crm_qualificacao"]
          renda_familiar: string | null
          responsavel_id: string
          responsavel_venda_imobiliaria_id: string | null
          responsavel_venda_user_id: string | null
          satisfacao_atendimento: number | null
          satisfacao_produto: number | null
          sexo: string | null
          status: Database["public"]["Enums"]["crm_deal_status"]
          tipo_residencia: string | null
          updated_at: string
          valor_entrada: number | null
          versao_tabela: string | null
        }
        Insert: {
          cidade_cliente?: string | null
          cliente_email?: string | null
          cliente_nome: string
          created_at?: string
          data_nascimento?: string | null
          empreendimento_id?: string | null
          escolaridade?: string | null
          estado_civil?: string | null
          filhos?: string | null
          fonte_id?: string | null
          forma_pagamento?: string | null
          id?: string
          interesse?: string | null
          interesses_pessoais?: string[] | null
          link_contrato?: string | null
          logradouro?: string | null
          motivo_perda_id?: string | null
          nacionalidade?: string | null
          numero_logradouro?: string | null
          numero_lote?: string | null
          ordem_kanban?: number
          preco_lote?: number | null
          qualificacao?: Database["public"]["Enums"]["crm_qualificacao"]
          renda_familiar?: string | null
          responsavel_id: string
          responsavel_venda_imobiliaria_id?: string | null
          responsavel_venda_user_id?: string | null
          satisfacao_atendimento?: number | null
          satisfacao_produto?: number | null
          sexo?: string | null
          status?: Database["public"]["Enums"]["crm_deal_status"]
          tipo_residencia?: string | null
          updated_at?: string
          valor_entrada?: number | null
          versao_tabela?: string | null
        }
        Update: {
          cidade_cliente?: string | null
          cliente_email?: string | null
          cliente_nome?: string
          created_at?: string
          data_nascimento?: string | null
          empreendimento_id?: string | null
          escolaridade?: string | null
          estado_civil?: string | null
          filhos?: string | null
          fonte_id?: string | null
          forma_pagamento?: string | null
          id?: string
          interesse?: string | null
          interesses_pessoais?: string[] | null
          link_contrato?: string | null
          logradouro?: string | null
          motivo_perda_id?: string | null
          nacionalidade?: string | null
          numero_logradouro?: string | null
          numero_lote?: string | null
          ordem_kanban?: number
          preco_lote?: number | null
          qualificacao?: Database["public"]["Enums"]["crm_qualificacao"]
          renda_familiar?: string | null
          responsavel_id?: string
          responsavel_venda_imobiliaria_id?: string | null
          responsavel_venda_user_id?: string | null
          satisfacao_atendimento?: number | null
          satisfacao_produto?: number | null
          sexo?: string | null
          status?: Database["public"]["Enums"]["crm_deal_status"]
          tipo_residencia?: string | null
          updated_at?: string
          valor_entrada?: number | null
          versao_tabela?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "crm_empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_fonte_id_fkey"
            columns: ["fonte_id"]
            isOneToOne: false
            referencedRelation: "crm_fontes_lead"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_motivo_perda_id_fkey"
            columns: ["motivo_perda_id"]
            isOneToOne: false
            referencedRelation: "crm_motivos_perda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_responsavel_venda_imobiliaria_fkey"
            columns: ["responsavel_venda_imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_empreendimentos: {
        Row: {
          ativo: boolean
          cidade: string
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cidade?: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cidade?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_fontes_lead: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      crm_motivos_perda: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      crm_task_images: {
        Row: {
          id: string
          image_url: string
          nome_arquivo: string
          task_id: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          image_url: string
          nome_arquivo?: string
          task_id: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          nome_arquivo?: string
          task_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_task_images_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "crm_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          concluida: boolean
          created_at: string
          data_vencimento: string | null
          deal_id: string
          descricao: string | null
          id: string
          responsavel_id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          concluida?: boolean
          created_at?: string
          data_vencimento?: string | null
          deal_id: string
          descricao?: string | null
          id?: string
          responsavel_id: string
          titulo: string
          updated_at?: string
        }
        Update: {
          concluida?: boolean
          created_at?: string
          data_vencimento?: string | null
          deal_id?: string
          descricao?: string | null
          id?: string
          responsavel_id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      esquadro_comentarios: {
        Row: {
          conteudo: string
          created_at: string
          demanda_id: string
          id: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          demanda_id: string
          id?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          demanda_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "esquadro_comentarios_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "esquadro_demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      esquadro_custo_hora_historico: {
        Row: {
          created_at: string
          custo_hora: number
          id: string
          user_id: string
          vigencia_fim: string | null
          vigencia_inicio: string
        }
        Insert: {
          created_at?: string
          custo_hora: number
          id?: string
          user_id: string
          vigencia_fim?: string | null
          vigencia_inicio: string
        }
        Update: {
          created_at?: string
          custo_hora?: number
          id?: string
          user_id?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string
        }
        Relationships: []
      }
      esquadro_demandas: {
        Row: {
          arquiteta_id: string | null
          created_at: string
          data_solicitacao: string
          empreendimento_id: string
          horas_estimadas: number | null
          id: string
          instrucoes: string | null
          ordem_kanban: number
          prazo: string | null
          prazo_estimado: string | null
          prioridade: number
          status_id: string
          tipo_projeto_id: string
          updated_at: string
        }
        Insert: {
          arquiteta_id?: string | null
          created_at?: string
          data_solicitacao?: string
          empreendimento_id: string
          horas_estimadas?: number | null
          id?: string
          instrucoes?: string | null
          ordem_kanban?: number
          prazo?: string | null
          prazo_estimado?: string | null
          prioridade?: number
          status_id: string
          tipo_projeto_id: string
          updated_at?: string
        }
        Update: {
          arquiteta_id?: string | null
          created_at?: string
          data_solicitacao?: string
          empreendimento_id?: string
          horas_estimadas?: number | null
          id?: string
          instrucoes?: string | null
          ordem_kanban?: number
          prazo?: string | null
          prazo_estimado?: string | null
          prioridade?: number
          status_id?: string
          tipo_projeto_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "esquadro_demandas_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "esquadro_empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esquadro_demandas_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "esquadro_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esquadro_demandas_tipo_projeto_id_fkey"
            columns: ["tipo_projeto_id"]
            isOneToOne: false
            referencedRelation: "esquadro_tipos_projeto"
            referencedColumns: ["id"]
          },
        ]
      }
      esquadro_empreendimentos: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      esquadro_impugnacoes: {
        Row: {
          created_at: string | null
          data: string
          demanda_id: string
          descricao: string
          id: string
        }
        Insert: {
          created_at?: string | null
          data?: string
          demanda_id: string
          descricao: string
          id?: string
        }
        Update: {
          created_at?: string | null
          data?: string
          demanda_id?: string
          descricao?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "esquadro_impugnacoes_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "esquadro_demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      esquadro_motivos_nao_trabalho: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      esquadro_profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          created_at: string
          custo_hora: number | null
          email: string
          id: string
          nome: string
          role: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          custo_hora?: number | null
          email?: string
          id: string
          nome?: string
          role?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          custo_hora?: number | null
          email?: string
          id?: string
          nome?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      esquadro_registro_horas: {
        Row: {
          created_at: string
          data: string
          demanda_id: string | null
          horas: number
          id: string
          motivo_nao_trabalho_id: string | null
          observacao: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          demanda_id?: string | null
          horas?: number
          id?: string
          motivo_nao_trabalho_id?: string | null
          observacao?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          demanda_id?: string | null
          horas?: number
          id?: string
          motivo_nao_trabalho_id?: string | null
          observacao?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "esquadro_registro_horas_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "esquadro_demandas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esquadro_registro_horas_motivo_nao_trabalho_id_fkey"
            columns: ["motivo_nao_trabalho_id"]
            isOneToOne: false
            referencedRelation: "esquadro_motivos_nao_trabalho"
            referencedColumns: ["id"]
          },
        ]
      }
      esquadro_status: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      esquadro_tipos_projeto: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      esquadro_user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["esquadro_app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["esquadro_app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["esquadro_app_role"]
          user_id?: string
        }
        Relationships: []
      }
      gleba_anexos: {
        Row: {
          arquivo: string
          created_at: string
          created_by: string | null
          gleba_id: string
          id: string
          nome_arquivo: string
          tipo: Database["public"]["Enums"]["tipo_anexo_gleba"]
        }
        Insert: {
          arquivo: string
          created_at?: string
          created_by?: string | null
          gleba_id: string
          id?: string
          nome_arquivo: string
          tipo: Database["public"]["Enums"]["tipo_anexo_gleba"]
        }
        Update: {
          arquivo?: string
          created_at?: string
          created_by?: string | null
          gleba_id?: string
          id?: string
          nome_arquivo?: string
          tipo?: Database["public"]["Enums"]["tipo_anexo_gleba"]
        }
        Relationships: [
          {
            foreignKeyName: "gleba_anexos_gleba_id_fkey"
            columns: ["gleba_id"]
            isOneToOne: false
            referencedRelation: "glebas"
            referencedColumns: ["id"]
          },
        ]
      }
      glebas: {
        Row: {
          aceita_permuta: Database["public"]["Enums"]["permuta_status"] | null
          apelido: string
          arquivo_contrato: string | null
          arquivo_kmz: string | null
          arquivo_protocolo: string | null
          cidade_id: string | null
          comentarios: string | null
          created_at: string
          data_fechamento: string | null
          data_visita: string | null
          descricao_descarte: string | null
          google_drive_file_id: string | null
          id: string
          imagem_capa: string | null
          imobiliaria_id: string | null
          kml_id: string | null
          last_sync_at: string | null
          motivo_descarte_id: string | null
          numero: number | null
          percentual_permuta: number | null
          poligono_geojson: Json | null
          preco: number | null
          prioridade: boolean
          proprietario_nome: string | null
          responsavel_analise: string | null
          standby_inicio: string | null
          standby_motivo: string | null
          status: Database["public"]["Enums"]["gleba_status"]
          tamanho_lote_minimo: number | null
          tamanho_m2: number | null
          updated_at: string
          zona_plano_diretor: string | null
        }
        Insert: {
          aceita_permuta?: Database["public"]["Enums"]["permuta_status"] | null
          apelido: string
          arquivo_contrato?: string | null
          arquivo_kmz?: string | null
          arquivo_protocolo?: string | null
          cidade_id?: string | null
          comentarios?: string | null
          created_at?: string
          data_fechamento?: string | null
          data_visita?: string | null
          descricao_descarte?: string | null
          google_drive_file_id?: string | null
          id?: string
          imagem_capa?: string | null
          imobiliaria_id?: string | null
          kml_id?: string | null
          last_sync_at?: string | null
          motivo_descarte_id?: string | null
          numero?: number | null
          percentual_permuta?: number | null
          poligono_geojson?: Json | null
          preco?: number | null
          prioridade?: boolean
          proprietario_nome?: string | null
          responsavel_analise?: string | null
          standby_inicio?: string | null
          standby_motivo?: string | null
          status?: Database["public"]["Enums"]["gleba_status"]
          tamanho_lote_minimo?: number | null
          tamanho_m2?: number | null
          updated_at?: string
          zona_plano_diretor?: string | null
        }
        Update: {
          aceita_permuta?: Database["public"]["Enums"]["permuta_status"] | null
          apelido?: string
          arquivo_contrato?: string | null
          arquivo_kmz?: string | null
          arquivo_protocolo?: string | null
          cidade_id?: string | null
          comentarios?: string | null
          created_at?: string
          data_fechamento?: string | null
          data_visita?: string | null
          descricao_descarte?: string | null
          google_drive_file_id?: string | null
          id?: string
          imagem_capa?: string | null
          imobiliaria_id?: string | null
          kml_id?: string | null
          last_sync_at?: string | null
          motivo_descarte_id?: string | null
          numero?: number | null
          percentual_permuta?: number | null
          poligono_geojson?: Json | null
          preco?: number | null
          prioridade?: boolean
          proprietario_nome?: string | null
          responsavel_analise?: string | null
          standby_inicio?: string | null
          standby_motivo?: string | null
          status?: Database["public"]["Enums"]["gleba_status"]
          tamanho_lote_minimo?: number | null
          tamanho_m2?: number | null
          updated_at?: string
          zona_plano_diretor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "glebas_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "glebas_imobiliaria_id_fkey"
            columns: ["imobiliaria_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "glebas_motivo_descarte_id_fkey"
            columns: ["motivo_descarte_id"]
            isOneToOne: false
            referencedRelation: "motivos_descarte"
            referencedColumns: ["id"]
          },
        ]
      }
      imobiliarias: {
        Row: {
          contato_nome: string | null
          created_at: string
          id: string
          link_social: string | null
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          contato_nome?: string | null
          created_at?: string
          id?: string
          link_social?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          contato_nome?: string | null
          created_at?: string
          id?: string
          link_social?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      motivos_descarte: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      propostas: {
        Row: {
          arquivo_carta: string | null
          created_at: string
          created_by: string | null
          data_proposta: string
          descricao: string | null
          gleba_id: string
          id: string
          percentual_proposto: number | null
          preco_ha: number | null
          tipo: Database["public"]["Enums"]["tipo_proposta"]
          updated_at: string
        }
        Insert: {
          arquivo_carta?: string | null
          created_at?: string
          created_by?: string | null
          data_proposta?: string
          descricao?: string | null
          gleba_id: string
          id?: string
          percentual_proposto?: number | null
          preco_ha?: number | null
          tipo?: Database["public"]["Enums"]["tipo_proposta"]
          updated_at?: string
        }
        Update: {
          arquivo_carta?: string | null
          created_at?: string
          created_by?: string | null
          data_proposta?: string
          descricao?: string | null
          gleba_id?: string
          id?: string
          percentual_proposto?: number | null
          preco_ha?: number | null
          tipo?: Database["public"]["Enums"]["tipo_proposta"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "propostas_gleba_id_fkey"
            columns: ["gleba_id"]
            isOneToOne: false
            referencedRelation: "glebas"
            referencedColumns: ["id"]
          },
        ]
      }
      report_configs: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string
          destinatarios: string[]
          id: string
          nome: string
          report_key: string
          ultimo_envio: string | null
          ultimo_relatorio_html: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          destinatarios?: string[]
          id?: string
          nome: string
          report_key: string
          ultimo_envio?: string | null
          ultimo_relatorio_html?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          destinatarios?: string[]
          id?: string
          nome?: string
          report_key?: string
          ultimo_envio?: string | null
          ultimo_relatorio_html?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      esquadro_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["esquadro_app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      get_all_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_emails: {
        Args: { user_ids: string[] }
        Returns: {
          email: string
          id: string
          nome: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      crm_deal_status:
        | "lead_recebido"
        | "contato_feito"
        | "visita_agendada"
        | "visita_realizada"
        | "ficha_assinada"
        | "proposta_recebida"
        | "perdido"
        | "vendido"
      crm_qualificacao: "frio" | "morno" | "quente"
      esquadro_app_role: "admin" | "arquiteta"
      gleba_status:
        | "identificada"
        | "informacoes_recebidas"
        | "visita_realizada"
        | "proposta_enviada"
        | "protocolo_assinado"
        | "descartada"
        | "proposta_recusada"
        | "negocio_fechado"
        | "standby"
      permuta_status: "incerto" | "nao" | "sim"
      tipo_anexo_gleba:
        | "pesquisa_mercado"
        | "planilha_viabilidade"
        | "matricula_imovel"
      tipo_proposta: "compra" | "parceria" | "mista"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      crm_deal_status: [
        "lead_recebido",
        "contato_feito",
        "visita_agendada",
        "visita_realizada",
        "ficha_assinada",
        "proposta_recebida",
        "perdido",
        "vendido",
      ],
      crm_qualificacao: ["frio", "morno", "quente"],
      esquadro_app_role: ["admin", "arquiteta"],
      gleba_status: [
        "identificada",
        "informacoes_recebidas",
        "visita_realizada",
        "proposta_enviada",
        "protocolo_assinado",
        "descartada",
        "proposta_recusada",
        "negocio_fechado",
        "standby",
      ],
      permuta_status: ["incerto", "nao", "sim"],
      tipo_anexo_gleba: [
        "pesquisa_mercado",
        "planilha_viabilidade",
        "matricula_imovel",
      ],
      tipo_proposta: ["compra", "parceria", "mista"],
    },
  },
} as const
