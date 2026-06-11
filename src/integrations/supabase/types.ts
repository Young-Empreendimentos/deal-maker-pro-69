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
      aditivo_empreendimentos: {
        Row: {
          created_at: string
          id: string
          nome: string
          taxa_padrao: number
          template_path: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          taxa_padrao: number
          template_path?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          taxa_padrao?: number
          template_path?: string | null
        }
        Relationships: []
      }
      aditivo_profiles: {
        Row: {
          created_at: string
          id: string
          nome: string | null
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          nome?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string | null
          role?: string
        }
        Relationships: []
      }
      aditivo_taxa_regras: {
        Row: {
          bracket_pago: string
          created_at: string
          data_contrato_fim: string | null
          data_contrato_ini: string | null
          empreendimento_id: string
          id: string
          taxa_mensal: number
          terreno_registrado: boolean
        }
        Insert: {
          bracket_pago: string
          created_at?: string
          data_contrato_fim?: string | null
          data_contrato_ini?: string | null
          empreendimento_id: string
          id?: string
          taxa_mensal: number
          terreno_registrado: boolean
        }
        Update: {
          bracket_pago?: string
          created_at?: string
          data_contrato_fim?: string | null
          data_contrato_ini?: string | null
          empreendimento_id?: string
          id?: string
          taxa_mensal?: number
          terreno_registrado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "aditivo_taxa_regras_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "aditivo_empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      atividades: {
        Row: {
          created_at: string
          data: string
          descricao: string
          gleba_id: string | null
          id: string
          responsavel_id: string
          tipo_atividade_id: string | null
        }
        Insert: {
          created_at?: string
          data?: string
          descricao: string
          gleba_id?: string | null
          id?: string
          responsavel_id: string
          tipo_atividade_id?: string | null
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          gleba_id?: string | null
          id?: string
          responsavel_id?: string
          tipo_atividade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atividades_gleba_id_fkey"
            columns: ["gleba_id"]
            isOneToOne: false
            referencedRelation: "glebas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_tipo_atividade_id_fkey"
            columns: ["tipo_atividade_id"]
            isOneToOne: false
            referencedRelation: "tipos_atividade"
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
      cobranca_config_calculo_intimacao: {
        Row: {
          ativo: boolean
          atualizado_em: string
          correcao_aplicacao: string | null
          criado_em: string
          descricao: string | null
          id: number
          indexador_padrao: string | null
          juros_diario: number | null
          juros_mensal: number | null
          multa_aplicacao: string | null
          multa_percentual: number | null
          nome: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          correcao_aplicacao?: string | null
          criado_em?: string
          descricao?: string | null
          id: number
          indexador_padrao?: string | null
          juros_diario?: number | null
          juros_mensal?: number | null
          multa_aplicacao?: string | null
          multa_percentual?: number | null
          nome: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          correcao_aplicacao?: string | null
          criado_em?: string
          descricao?: string | null
          id?: number
          indexador_padrao?: string | null
          juros_diario?: number | null
          juros_mensal?: number | null
          multa_aplicacao?: string | null
          multa_percentual?: number | null
          nome?: string
        }
        Relationships: []
      }
      cobranca_config_gdrive_empreendimento: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          empreendimento_id: number
          empreendimento_nome: string | null
          gdrive_folder_id: string | null
          gdrive_folder_url: string | null
          id: number
          padrao_nome_matricula: string | null
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          empreendimento_id: number
          empreendimento_nome?: string | null
          gdrive_folder_id?: string | null
          gdrive_folder_url?: string | null
          id: number
          padrao_nome_matricula?: string | null
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          empreendimento_id?: number
          empreendimento_nome?: string | null
          gdrive_folder_id?: string | null
          gdrive_folder_url?: string | null
          id?: number
          padrao_nome_matricula?: string | null
        }
        Relationships: []
      }
      cobranca_empreendimentos: {
        Row: {
          atualizado_em: string
          criado_em: string
          empresa_id: number
          id: number
          nome: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          empresa_id: number
          id: number
          nome?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          empresa_id?: number
          id?: number
          nome?: string | null
        }
        Relationships: []
      }
      cobranca_empresas: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: number
          nome: string
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id: number
          nome: string
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: number
          nome?: string
        }
        Relationships: []
      }
      cobranca_followup_cobrancas: {
        Row: {
          assunto_email_sienge: string | null
          cliente_email: string | null
          cliente_id: number
          cliente_nome: string | null
          created_at: string
          data_alerta_notificacao_1: string | null
          data_alerta_retorno: string | null
          data_email_sienge: string | null
          data_envio_notificacao_1: string | null
          data_envio_notificacao_2: string | null
          data_retorno: string | null
          documento_titulo: string | null
          email_sienge_id: number | null
          empreendimento_id: number | null
          empreendimento_nome: string | null
          id: number
          notificacao_1_id: number | null
          notificacao_2_id: number | null
          observacao_retorno: string | null
          qtd_parcelas_atraso: number | null
          recebeu_retorno: boolean | null
          status: string
          unidade: string | null
          updated_at: string
          valor_atraso: number | null
        }
        Insert: {
          assunto_email_sienge?: string | null
          cliente_email?: string | null
          cliente_id: number
          cliente_nome?: string | null
          created_at?: string
          data_alerta_notificacao_1?: string | null
          data_alerta_retorno?: string | null
          data_email_sienge?: string | null
          data_envio_notificacao_1?: string | null
          data_envio_notificacao_2?: string | null
          data_retorno?: string | null
          documento_titulo?: string | null
          email_sienge_id?: number | null
          empreendimento_id?: number | null
          empreendimento_nome?: string | null
          id: number
          notificacao_1_id?: number | null
          notificacao_2_id?: number | null
          observacao_retorno?: string | null
          qtd_parcelas_atraso?: number | null
          recebeu_retorno?: boolean | null
          status?: string
          unidade?: string | null
          updated_at?: string
          valor_atraso?: number | null
        }
        Update: {
          assunto_email_sienge?: string | null
          cliente_email?: string | null
          cliente_id?: number
          cliente_nome?: string | null
          created_at?: string
          data_alerta_notificacao_1?: string | null
          data_alerta_retorno?: string | null
          data_email_sienge?: string | null
          data_envio_notificacao_1?: string | null
          data_envio_notificacao_2?: string | null
          data_retorno?: string | null
          documento_titulo?: string | null
          email_sienge_id?: number | null
          empreendimento_id?: number | null
          empreendimento_nome?: string | null
          id?: number
          notificacao_1_id?: number | null
          notificacao_2_id?: number | null
          observacao_retorno?: string | null
          qtd_parcelas_atraso?: number | null
          recebeu_retorno?: boolean | null
          status?: string
          unidade?: string | null
          updated_at?: string
          valor_atraso?: number | null
        }
        Relationships: []
      }
      cobranca_historico_emails: {
        Row: {
          assunto: string | null
          cliente_id: number | null
          cliente_nome: string | null
          created_at: string | null
          data_envio: string | null
          data_vencimento: string | null
          documento_titulo: string | null
          email: string | null
          empreendimento_id: number | null
          empreendimento_nome: string | null
          empresa_id: number | null
          empresa_nome: string | null
          enviou_email: boolean | null
          enviou_sms: boolean | null
          id: number
          mensagem_notificacao: string | null
          origem: string | null
          parcela_id: number | null
          referencia: string | null
          sienge_id: number | null
          situacao: string | null
          titulo_id: number | null
          valor_parcela: string | null
        }
        Insert: {
          assunto?: string | null
          cliente_id?: number | null
          cliente_nome?: string | null
          created_at?: string | null
          data_envio?: string | null
          data_vencimento?: string | null
          documento_titulo?: string | null
          email?: string | null
          empreendimento_id?: number | null
          empreendimento_nome?: string | null
          empresa_id?: number | null
          empresa_nome?: string | null
          enviou_email?: boolean | null
          enviou_sms?: boolean | null
          id?: number
          mensagem_notificacao?: string | null
          origem?: string | null
          parcela_id?: number | null
          referencia?: string | null
          sienge_id?: number | null
          situacao?: string | null
          titulo_id?: number | null
          valor_parcela?: string | null
        }
        Update: {
          assunto?: string | null
          cliente_id?: number | null
          cliente_nome?: string | null
          created_at?: string | null
          data_envio?: string | null
          data_vencimento?: string | null
          documento_titulo?: string | null
          email?: string | null
          empreendimento_id?: number | null
          empreendimento_nome?: string | null
          empresa_id?: number | null
          empresa_nome?: string | null
          enviou_email?: boolean | null
          enviou_sms?: boolean | null
          id?: number
          mensagem_notificacao?: string | null
          origem?: string | null
          parcela_id?: number | null
          referencia?: string | null
          sienge_id?: number | null
          situacao?: string | null
          titulo_id?: number | null
          valor_parcela?: string | null
        }
        Relationships: []
      }
      cobranca_historico_sincronizacao: {
        Row: {
          empreendimento_id: number | null
          empresa_id: number | null
          executado_em: string | null
          id: number
          mensagem: string | null
          registros_importados: number | null
          status: string
        }
        Insert: {
          empreendimento_id?: number | null
          empresa_id?: number | null
          executado_em?: string | null
          id?: number
          mensagem?: string | null
          registros_importados?: number | null
          status: string
        }
        Update: {
          empreendimento_id?: number | null
          empresa_id?: number | null
          executado_em?: string | null
          id?: number
          mensagem?: string | null
          registros_importados?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cobranca_historico_sincronizacao_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "cobranca_empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobranca_historico_sincronizacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "cobranca_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cobranca_inadimplencia: {
        Row: {
          acrescimos: number | null
          atraso_atualizado: number | null
          atraso_desde: string | null
          atualizado_em: string | null
          cliente_cpf: string | null
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_id: number | null
          cliente_telefone: string | null
          contrato_id: number | null
          criado_em: string | null
          dados_originais: Json | null
          data_contrato: string | null
          data_venda: string | null
          documento_titulo: string | null
          empreendimento_id: number
          empreendimento_nome: string | null
          empresa_id: number
          id: number
          numero_contrato: string | null
          proprietario: string | null
          qtd_parcelas: number | null
          saldo_devedor: number | null
          status: string | null
          unidade: string | null
          valor_corrigido: number | null
          valor_recebido: number | null
          valor_total_contrato: number | null
        }
        Insert: {
          acrescimos?: number | null
          atraso_atualizado?: number | null
          atraso_desde?: string | null
          atualizado_em?: string | null
          cliente_cpf?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_id?: number | null
          cliente_telefone?: string | null
          contrato_id?: number | null
          criado_em?: string | null
          dados_originais?: Json | null
          data_contrato?: string | null
          data_venda?: string | null
          documento_titulo?: string | null
          empreendimento_id: number
          empreendimento_nome?: string | null
          empresa_id: number
          id?: number
          numero_contrato?: string | null
          proprietario?: string | null
          qtd_parcelas?: number | null
          saldo_devedor?: number | null
          status?: string | null
          unidade?: string | null
          valor_corrigido?: number | null
          valor_recebido?: number | null
          valor_total_contrato?: number | null
        }
        Update: {
          acrescimos?: number | null
          atraso_atualizado?: number | null
          atraso_desde?: string | null
          atualizado_em?: string | null
          cliente_cpf?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_id?: number | null
          cliente_telefone?: string | null
          contrato_id?: number | null
          criado_em?: string | null
          dados_originais?: Json | null
          data_contrato?: string | null
          data_venda?: string | null
          documento_titulo?: string | null
          empreendimento_id?: number
          empreendimento_nome?: string | null
          empresa_id?: number
          id?: number
          numero_contrato?: string | null
          proprietario?: string | null
          qtd_parcelas?: number | null
          saldo_devedor?: number | null
          status?: string | null
          unidade?: string | null
          valor_corrigido?: number | null
          valor_recebido?: number | null
          valor_total_contrato?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cobranca_inadimplencia_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "cobranca_empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobranca_inadimplencia_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "cobranca_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cobranca_indexadores_sienge: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          descricao: string | null
          id: number
          nome: string
          sienge_id: number | null
          sigla: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string | null
          id: number
          nome: string
          sienge_id?: number | null
          sigla: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: number
          nome?: string
          sienge_id?: number | null
          sigla?: string
        }
        Relationships: []
      }
      cobranca_indices_correcao: {
        Row: {
          acumulado_ano: number | null
          ano: number
          atualizado_em: string
          criado_em: string
          fonte: string | null
          id: number
          mes: number
          tipo: string
          valor: number
        }
        Insert: {
          acumulado_ano?: number | null
          ano: number
          atualizado_em?: string
          criado_em?: string
          fonte?: string | null
          id: number
          mes: number
          tipo: string
          valor: number
        }
        Update: {
          acumulado_ano?: number | null
          ano?: number
          atualizado_em?: string
          criado_em?: string
          fonte?: string | null
          id?: number
          mes?: number
          tipo?: string
          valor?: number
        }
        Relationships: []
      }
      cobranca_intimacoes_enviadas: {
        Row: {
          arquivo_pdf: string | null
          arquivo_word: string | null
          atualizado_em: string
          cliente_cpf: string | null
          cliente_email: string | null
          cliente_id: number | null
          cliente_nome: string | null
          criado_em: string
          data_base_calculo: string | null
          data_envio_email: string | null
          data_limite_calculo: string | null
          empreendimento_id: number | null
          empreendimento_nome: string | null
          enviado_email: boolean
          id: number
          inadimplencia_id: number | null
          indexador_utilizado: string | null
          juros_diario_utilizado: number | null
          matricula_anexada: boolean | null
          matricula_arquivo: string | null
          matricula_numero: string | null
          modelo_utilizado: string | null
          multa_percentual_utilizado: number | null
          numero_contrato: string | null
          qtd_parcelas_calculadas: number | null
          quadro_financeiro: Json | null
          status: string
          unidade: string | null
          valor_corrigido_total: number | null
          valor_juros_total: number | null
          valor_multa_total: number | null
          valor_original_total: number | null
          valor_total_calculado: number | null
        }
        Insert: {
          arquivo_pdf?: string | null
          arquivo_word?: string | null
          atualizado_em?: string
          cliente_cpf?: string | null
          cliente_email?: string | null
          cliente_id?: number | null
          cliente_nome?: string | null
          criado_em?: string
          data_base_calculo?: string | null
          data_envio_email?: string | null
          data_limite_calculo?: string | null
          empreendimento_id?: number | null
          empreendimento_nome?: string | null
          enviado_email?: boolean
          id: number
          inadimplencia_id?: number | null
          indexador_utilizado?: string | null
          juros_diario_utilizado?: number | null
          matricula_anexada?: boolean | null
          matricula_arquivo?: string | null
          matricula_numero?: string | null
          modelo_utilizado?: string | null
          multa_percentual_utilizado?: number | null
          numero_contrato?: string | null
          qtd_parcelas_calculadas?: number | null
          quadro_financeiro?: Json | null
          status?: string
          unidade?: string | null
          valor_corrigido_total?: number | null
          valor_juros_total?: number | null
          valor_multa_total?: number | null
          valor_original_total?: number | null
          valor_total_calculado?: number | null
        }
        Update: {
          arquivo_pdf?: string | null
          arquivo_word?: string | null
          atualizado_em?: string
          cliente_cpf?: string | null
          cliente_email?: string | null
          cliente_id?: number | null
          cliente_nome?: string | null
          criado_em?: string
          data_base_calculo?: string | null
          data_envio_email?: string | null
          data_limite_calculo?: string | null
          empreendimento_id?: number | null
          empreendimento_nome?: string | null
          enviado_email?: boolean
          id?: number
          inadimplencia_id?: number | null
          indexador_utilizado?: string | null
          juros_diario_utilizado?: number | null
          matricula_anexada?: boolean | null
          matricula_arquivo?: string | null
          matricula_numero?: string | null
          modelo_utilizado?: string | null
          multa_percentual_utilizado?: number | null
          numero_contrato?: string | null
          qtd_parcelas_calculadas?: number | null
          quadro_financeiro?: Json | null
          status?: string
          unidade?: string | null
          valor_corrigido_total?: number | null
          valor_juros_total?: number | null
          valor_multa_total?: number | null
          valor_original_total?: number | null
          valor_total_calculado?: number | null
        }
        Relationships: []
      }
      cobranca_modelos_intimacao: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          caminho_arquivo: string
          criado_em: string | null
          descricao: string | null
          empreendimento_id: number | null
          id: number
          nome: string
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          caminho_arquivo: string
          criado_em?: string | null
          descricao?: string | null
          empreendimento_id?: number | null
          id?: number
          nome: string
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          caminho_arquivo?: string
          criado_em?: string | null
          descricao?: string | null
          empreendimento_id?: number | null
          id?: number
          nome?: string
          tipo?: string | null
        }
        Relationships: []
      }
      cobranca_modelos_notificacao: {
        Row: {
          arquivo_path: string | null
          ativo: boolean | null
          created_at: string | null
          empreendimento_id: number
          empreendimento_nome: string | null
          id: number
          nome_modelo: string
          tipo_notificacao: string | null
          updated_at: string | null
          variaveis_disponiveis: string[] | null
        }
        Insert: {
          arquivo_path?: string | null
          ativo?: boolean | null
          created_at?: string | null
          empreendimento_id: number
          empreendimento_nome?: string | null
          id?: number
          nome_modelo: string
          tipo_notificacao?: string | null
          updated_at?: string | null
          variaveis_disponiveis?: string[] | null
        }
        Update: {
          arquivo_path?: string | null
          ativo?: boolean | null
          created_at?: string | null
          empreendimento_id?: number
          empreendimento_nome?: string | null
          id?: number
          nome_modelo?: string
          tipo_notificacao?: string | null
          updated_at?: string | null
          variaveis_disponiveis?: string[] | null
        }
        Relationships: []
      }
      cobranca_notificacoes_enviadas: {
        Row: {
          cliente_email: string | null
          cliente_nome: string | null
          created_at: string | null
          data_envio: string | null
          data_geracao: string | null
          documento_titulo: string | null
          empreendimento_id: number | null
          empreendimento_nome: string | null
          erro_mensagem: string | null
          id: number
          pdf_path: string | null
          status: string | null
          unidade: string | null
          valor_cobrado: number | null
        }
        Insert: {
          cliente_email?: string | null
          cliente_nome?: string | null
          created_at?: string | null
          data_envio?: string | null
          data_geracao?: string | null
          documento_titulo?: string | null
          empreendimento_id?: number | null
          empreendimento_nome?: string | null
          erro_mensagem?: string | null
          id?: number
          pdf_path?: string | null
          status?: string | null
          unidade?: string | null
          valor_cobrado?: number | null
        }
        Update: {
          cliente_email?: string | null
          cliente_nome?: string | null
          created_at?: string | null
          data_envio?: string | null
          data_geracao?: string | null
          documento_titulo?: string | null
          empreendimento_id?: number | null
          empreendimento_nome?: string | null
          erro_mensagem?: string | null
          id?: number
          pdf_path?: string | null
          status?: string | null
          unidade?: string | null
          valor_cobrado?: number | null
        }
        Relationships: []
      }
      cobrancas_acoes: {
        Row: {
          anexo_nome: string | null
          anexo_url: string | null
          cobranca_id: string
          concluida: boolean
          created_at: string
          created_by: string | null
          data: string
          descricao: string
          id: string
          prazo: string | null
          tipo: Database["public"]["Enums"]["cobrancas_acao_tipo"]
          tipo_acao_id: string | null
        }
        Insert: {
          anexo_nome?: string | null
          anexo_url?: string | null
          cobranca_id: string
          concluida?: boolean
          created_at?: string
          created_by?: string | null
          data: string
          descricao: string
          id?: string
          prazo?: string | null
          tipo: Database["public"]["Enums"]["cobrancas_acao_tipo"]
          tipo_acao_id?: string | null
        }
        Update: {
          anexo_nome?: string | null
          anexo_url?: string | null
          cobranca_id?: string
          concluida?: boolean
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string
          id?: string
          prazo?: string | null
          tipo?: Database["public"]["Enums"]["cobrancas_acao_tipo"]
          tipo_acao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_acoes_cobranca_id_fkey"
            columns: ["cobranca_id"]
            isOneToOne: false
            referencedRelation: "cobrancas_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_acoes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "cobrancas_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobrancas_acoes_tipo_acao_id_fkey"
            columns: ["tipo_acao_id"]
            isOneToOne: false
            referencedRelation: "cobrancas_tipos_acao"
            referencedColumns: ["id"]
          },
        ]
      }
      cobrancas_custos: {
        Row: {
          acao_id: string
          created_at: string
          created_by: string | null
          descricao: string | null
          id: string
          valor: number
        }
        Insert: {
          acao_id: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          valor: number
        }
        Update: {
          acao_id?: string
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_custos_acao_id_fkey"
            columns: ["acao_id"]
            isOneToOne: false
            referencedRelation: "cobrancas_acoes"
            referencedColumns: ["id"]
          },
        ]
      }
      cobrancas_itens: {
        Row: {
          andamento: string
          atraso_desde: string
          cliente: string
          created_at: string
          created_by: string | null
          data_pagamento: string | null
          empreendimento: Database["public"]["Enums"]["cobrancas_empreendimento"]
          id: string
          lote: string
          prazo: string | null
          registrado: boolean
          responsavel: Database["public"]["Enums"]["cobrancas_responsavel"]
          status: string
          updated_at: string
        }
        Insert: {
          andamento?: string
          atraso_desde: string
          cliente: string
          created_at?: string
          created_by?: string | null
          data_pagamento?: string | null
          empreendimento: Database["public"]["Enums"]["cobrancas_empreendimento"]
          id?: string
          lote: string
          prazo?: string | null
          registrado?: boolean
          responsavel: Database["public"]["Enums"]["cobrancas_responsavel"]
          status?: string
          updated_at?: string
        }
        Update: {
          andamento?: string
          atraso_desde?: string
          cliente?: string
          created_at?: string
          created_by?: string | null
          data_pagamento?: string | null
          empreendimento?: Database["public"]["Enums"]["cobrancas_empreendimento"]
          id?: string
          lote?: string
          prazo?: string | null
          registrado?: boolean
          responsavel?: Database["public"]["Enums"]["cobrancas_responsavel"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_itens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "cobrancas_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      cobrancas_tipos_acao: {
        Row: {
          ativo: boolean
          created_at: string
          custo_obrigatorio: boolean
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          custo_obrigatorio?: boolean
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          custo_obrigatorio?: boolean
          id?: string
          nome?: string
        }
        Relationships: []
      }
      cobrancas_usuarios: {
        Row: {
          aprovado: boolean
          created_at: string
          email: string
          id: string
          nome: string
          responsavel:
            | Database["public"]["Enums"]["cobrancas_responsavel"]
            | null
          role: Database["public"]["Enums"]["cobrancas_role"]
          senha_hash: string
        }
        Insert: {
          aprovado?: boolean
          created_at?: string
          email: string
          id?: string
          nome: string
          responsavel?:
            | Database["public"]["Enums"]["cobrancas_responsavel"]
            | null
          role?: Database["public"]["Enums"]["cobrancas_role"]
          senha_hash: string
        }
        Update: {
          aprovado?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          responsavel?:
            | Database["public"]["Enums"]["cobrancas_responsavel"]
            | null
          role?: Database["public"]["Enums"]["cobrancas_role"]
          senha_hash?: string
        }
        Relationships: []
      }
      comercial_bonificacoes_auditoria: {
        Row: {
          bonificacao: number | null
          comissao_base: number | null
          comissao_total: number | null
          comprador: string | null
          corretor: string | null
          created_at: string
          empreendimento: string | null
          entrada: number | null
          id: number
          link_contrato: string | null
          num_lote: string | null
          usuario_autorizou: string | null
        }
        Insert: {
          bonificacao?: number | null
          comissao_base?: number | null
          comissao_total?: number | null
          comprador?: string | null
          corretor?: string | null
          created_at?: string
          empreendimento?: string | null
          entrada?: number | null
          id?: never
          link_contrato?: string | null
          num_lote?: string | null
          usuario_autorizou?: string | null
        }
        Update: {
          bonificacao?: number | null
          comissao_base?: number | null
          comissao_total?: number | null
          comprador?: string | null
          corretor?: string | null
          created_at?: string
          empreendimento?: string | null
          entrada?: number | null
          id?: never
          link_contrato?: string | null
          num_lote?: string | null
          usuario_autorizou?: string | null
        }
        Relationships: []
      }
      comercial_clientes_itaqui: {
        Row: {
          bairro: string | null
          bairro2: string | null
          cep: string | null
          cep2: string | null
          cidade: string | null
          cidade2: string | null
          corretor_id: string | null
          cpf: string | null
          cpf2: string | null
          created_at: string | null
          data_expedicao: string | null
          data_expedicao2: string | null
          data_nascimento: string | null
          data_nascimento2: string | null
          email: string | null
          email2: string | null
          estado_civil: string | null
          estado_civil2: string | null
          id: number
          logradouro: string | null
          logradouro2: string | null
          nacionalidade: string | null
          nacionalidade2: string | null
          nome: string
          nome2: string | null
          orgao_expedidor: string | null
          orgao_expedidor2: string | null
          profissao: string | null
          profissao2: string | null
          regime_bens: string | null
          regime_bens2: string | null
          rg: string | null
          rg2: string | null
          telefone: string | null
          telefone2: string | null
          uf: string | null
          uf2: string | null
        }
        Insert: {
          bairro?: string | null
          bairro2?: string | null
          cep?: string | null
          cep2?: string | null
          cidade?: string | null
          cidade2?: string | null
          corretor_id?: string | null
          cpf?: string | null
          cpf2?: string | null
          created_at?: string | null
          data_expedicao?: string | null
          data_expedicao2?: string | null
          data_nascimento?: string | null
          data_nascimento2?: string | null
          email?: string | null
          email2?: string | null
          estado_civil?: string | null
          estado_civil2?: string | null
          id?: number
          logradouro?: string | null
          logradouro2?: string | null
          nacionalidade?: string | null
          nacionalidade2?: string | null
          nome: string
          nome2?: string | null
          orgao_expedidor?: string | null
          orgao_expedidor2?: string | null
          profissao?: string | null
          profissao2?: string | null
          regime_bens?: string | null
          regime_bens2?: string | null
          rg?: string | null
          rg2?: string | null
          telefone?: string | null
          telefone2?: string | null
          uf?: string | null
          uf2?: string | null
        }
        Update: {
          bairro?: string | null
          bairro2?: string | null
          cep?: string | null
          cep2?: string | null
          cidade?: string | null
          cidade2?: string | null
          corretor_id?: string | null
          cpf?: string | null
          cpf2?: string | null
          created_at?: string | null
          data_expedicao?: string | null
          data_expedicao2?: string | null
          data_nascimento?: string | null
          data_nascimento2?: string | null
          email?: string | null
          email2?: string | null
          estado_civil?: string | null
          estado_civil2?: string | null
          id?: number
          logradouro?: string | null
          logradouro2?: string | null
          nacionalidade?: string | null
          nacionalidade2?: string | null
          nome?: string
          nome2?: string | null
          orgao_expedidor?: string | null
          orgao_expedidor2?: string | null
          profissao?: string | null
          profissao2?: string | null
          regime_bens?: string | null
          regime_bens2?: string | null
          rg?: string | null
          rg2?: string | null
          telefone?: string | null
          telefone2?: string | null
          uf?: string | null
          uf2?: string | null
        }
        Relationships: []
      }
      comercial_corretores: {
        Row: {
          ativo: boolean
          bairro: string | null
          banco_agencia: string | null
          banco_chave_pix: string | null
          banco_conta: string | null
          banco_nome: string | null
          banco_tipo: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          creci: string | null
          dados_bancarios: string | null
          email: string | null
          email_secundario: string | null
          endereco: string | null
          id: string
          imobiliaria_origem_id: string | null
          is_cadastro_completo: boolean
          nome: string
          nome_exibicao: string | null
          razao_social: string | null
          telefone: string | null
          tipo: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          banco_agencia?: string | null
          banco_chave_pix?: string | null
          banco_conta?: string | null
          banco_nome?: string | null
          banco_tipo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          creci?: string | null
          dados_bancarios?: string | null
          email?: string | null
          email_secundario?: string | null
          endereco?: string | null
          id?: string
          imobiliaria_origem_id?: string | null
          is_cadastro_completo?: boolean
          nome: string
          nome_exibicao?: string | null
          razao_social?: string | null
          telefone?: string | null
          tipo?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          banco_agencia?: string | null
          banco_chave_pix?: string | null
          banco_conta?: string | null
          banco_nome?: string | null
          banco_tipo?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          creci?: string | null
          dados_bancarios?: string | null
          email?: string | null
          email_secundario?: string | null
          endereco?: string | null
          id?: string
          imobiliaria_origem_id?: string | null
          is_cadastro_completo?: boolean
          nome?: string
          nome_exibicao?: string | null
          razao_social?: string | null
          telefone?: string | null
          tipo?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comercial_corretores_imobiliaria_origem_id_fkey"
            columns: ["imobiliaria_origem_id"]
            isOneToOne: false
            referencedRelation: "imobiliarias"
            referencedColumns: ["id"]
          },
        ]
      }
      comercial_dados_bancarios: {
        Row: {
          dados_bancarios: string
          empreendimento: string
          id: string
          proprietario: string
        }
        Insert: {
          dados_bancarios: string
          empreendimento: string
          id?: string
          proprietario?: string
        }
        Update: {
          dados_bancarios?: string
          empreendimento?: string
          id?: string
          proprietario?: string
        }
        Relationships: []
      }
      comercial_lotes_detalhes: {
        Row: {
          area: number | null
          empreendimento: string
          id: string
          match_status: string | null
          matricula: number | null
          num_lote: string
          onus: string | null
          proprietario: string | null
          sienge_unidade_id: number | null
        }
        Insert: {
          area?: number | null
          empreendimento: string
          id?: string
          match_status?: string | null
          matricula?: number | null
          num_lote: string
          onus?: string | null
          proprietario?: string | null
          sienge_unidade_id?: number | null
        }
        Update: {
          area?: number | null
          empreendimento?: string
          id?: string
          match_status?: string | null
          matricula?: number | null
          num_lote?: string
          onus?: string | null
          proprietario?: string | null
          sienge_unidade_id?: number | null
        }
        Relationships: []
      }
      comercial_promocoes: {
        Row: {
          ativa: boolean
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          empreendimento: string
          id: number
          prazo_maximo: number | null
          tipo_promocao: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          empreendimento?: string
          id?: number
          prazo_maximo?: number | null
          tipo_promocao?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          empreendimento?: string
          id?: number
          prazo_maximo?: number | null
          tipo_promocao?: string
        }
        Relationships: []
      }
      comercial_promocoes_precos: {
        Row: {
          created_at: string | null
          empreendimento: string
          id: number
          num_lote: string
          preco_promocional: number
          promocao_id: number
        }
        Insert: {
          created_at?: string | null
          empreendimento: string
          id?: number
          num_lote: string
          preco_promocional: number
          promocao_id: number
        }
        Update: {
          created_at?: string | null
          empreendimento?: string
          id?: number
          num_lote?: string
          preco_promocional?: number
          promocao_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "comercial_promocoes_precos_promocao_id_fkey"
            columns: ["promocao_id"]
            isOneToOne: false
            referencedRelation: "comercial_promocoes"
            referencedColumns: ["id"]
          },
        ]
      }
      comercial_tabela_precos: {
        Row: {
          created_at: string | null
          data_preco: string | null
          empreendimento: string | null
          id: number
          juros: number | null
          lote_id: string
          num_lote: string | null
          preco_av: number | null
          preco_minimo: number | null
        }
        Insert: {
          created_at?: string | null
          data_preco?: string | null
          empreendimento?: string | null
          id: number
          juros?: number | null
          lote_id: string
          num_lote?: string | null
          preco_av?: number | null
          preco_minimo?: number | null
        }
        Update: {
          created_at?: string | null
          data_preco?: string | null
          empreendimento?: string | null
          id?: number
          juros?: number | null
          lote_id?: string
          num_lote?: string | null
          preco_av?: number | null
          preco_minimo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comercial_tabela_precos_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "comercial_lotes_detalhes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comercial_tabela_precos_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "vw_lote_disponibilidade"
            referencedColumns: ["lote_id"]
          },
        ]
      }
      comercial_templates_contratos: {
        Row: {
          empreendimento: string
          id: string
          id_doc_aprazo: string
          id_doc_avista: string
          proprietario: string
        }
        Insert: {
          empreendimento: string
          id?: string
          id_doc_aprazo: string
          id_doc_avista: string
          proprietario?: string
        }
        Update: {
          empreendimento?: string
          id?: string
          id_doc_aprazo?: string
          id_doc_avista?: string
          proprietario?: string
        }
        Relationships: []
      }
      comissoes_auditoria: {
        Row: {
          acao: string
          dados_antes: Json | null
          dados_depois: Json | null
          descricao: string | null
          id: number
          registro_id: string | null
          tabela: string
          timestamp: string | null
          usuario: string
        }
        Insert: {
          acao: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          descricao?: string | null
          id?: number
          registro_id?: string | null
          tabela: string
          timestamp?: string | null
          usuario: string
        }
        Update: {
          acao?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          descricao?: string | null
          id?: number
          registro_id?: string | null
          tabela?: string
          timestamp?: string | null
          usuario?: string
        }
        Relationships: []
      }
      comissoes_configuracoes_emails: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          atualizado_por: number | null
          descricao: string | null
          emails: string[]
          id: number
          tipo: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: number | null
          descricao?: string | null
          emails: string[]
          id?: number
          tipo: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          atualizado_por?: number | null
          descricao?: string | null
          emails?: string[]
          id?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_emails_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "comissoes_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes_historico_aprovacoes: {
        Row: {
          acao: string | null
          comissao_id: number | null
          data_acao: string | null
          id: number
          observacoes: string | null
          realizado_por: number | null
          status_anterior: string | null
          status_novo: string | null
        }
        Insert: {
          acao?: string | null
          comissao_id?: number | null
          data_acao?: string | null
          id?: number
          observacoes?: string | null
          realizado_por?: number | null
          status_anterior?: string | null
          status_novo?: string | null
        }
        Update: {
          acao?: string | null
          comissao_id?: number | null
          data_acao?: string | null
          id?: number
          observacoes?: string | null
          realizado_por?: number | null
          status_anterior?: string | null
          status_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_historico_aprovacoes_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "comissoes_sienge_comissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_historico_aprovacoes_realizado_por_fkey"
            columns: ["realizado_por"]
            isOneToOne: false
            referencedRelation: "comissoes_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes_log_sincronizacoes: {
        Row: {
          created_at: string | null
          data_sincronizacao: string | null
          detalhes: Json | null
          id: number
          resultados: Json | null
          sucesso: boolean | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_sincronizacao?: string | null
          detalhes?: Json | null
          id?: number
          resultados?: Json | null
          sucesso?: boolean | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_sincronizacao?: string | null
          detalhes?: Json | null
          id?: number
          resultados?: Json | null
          sucesso?: boolean | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comissoes_lotes_aprovacao: {
        Row: {
          data_envio: string | null
          email_enviado: boolean | null
          enviado_por: number | null
          id: number
          status: string | null
          total_comissoes: number | null
          valor_total: number | null
        }
        Insert: {
          data_envio?: string | null
          email_enviado?: boolean | null
          enviado_por?: number | null
          id?: number
          status?: string | null
          total_comissoes?: number | null
          valor_total?: number | null
        }
        Update: {
          data_envio?: string | null
          email_enviado?: boolean | null
          enviado_por?: number | null
          id?: number
          status?: string | null
          total_comissoes?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_lotes_aprovacao_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "comissoes_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes_regras_comissoes: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          broker_id: string | null
          building_id: string | null
          criado_em: string | null
          descricao: string | null
          id: number
          nivel_consultor: number | null
          nome_regra: string
          ordem_prioridade: number | null
          percentual_comissao: number
          percentual_pagamento_minimo: number | null
          tem_auditoria: boolean | null
          valor_maximo_faturamento: number | null
          valor_minimo_faturamento: number | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          broker_id?: string | null
          building_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: number
          nivel_consultor?: number | null
          nome_regra: string
          ordem_prioridade?: number | null
          percentual_comissao: number
          percentual_pagamento_minimo?: number | null
          tem_auditoria?: boolean | null
          valor_maximo_faturamento?: number | null
          valor_minimo_faturamento?: number | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          broker_id?: string | null
          building_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: number
          nivel_consultor?: number | null
          nome_regra?: string
          ordem_prioridade?: number | null
          percentual_comissao?: number
          percentual_pagamento_minimo?: number | null
          tem_auditoria?: boolean | null
          valor_maximo_faturamento?: number | null
          valor_minimo_faturamento?: number | null
        }
        Relationships: []
      }
      comissoes_regras_gatilho: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: number
          inclui_itbi: boolean | null
          nome: string
          percentual: number
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: number
          inclui_itbi?: boolean | null
          nome: string
          percentual: number
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: number
          inclui_itbi?: boolean | null
          nome?: string
          percentual?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      comissoes_sienge_comissoes: {
        Row: {
          aprovado_por: number | null
          atingiu_gatilho: boolean | null
          atualizado_em: string | null
          bill_number: number | null
          billing_broker_id: string | null
          billing_broker_name: string | null
          block_edit: boolean | null
          broker_id: string | null
          broker_nome: string | null
          building_id: string | null
          commission_date: string | null
          commission_released_automatically: boolean | null
          commission_released_to_be_paid: boolean | null
          commission_value: number | null
          company_id: string | null
          company_name: string | null
          consider_embedded_interest: boolean | null
          contract_bill_number: number | null
          contract_percentage_paid: number | null
          criado_em: string | null
          customer_id: string | null
          customer_name: string | null
          customer_situation_type: string | null
          dados_completos: Json | null
          data_aprovacao: string | null
          data_comissao: string | null
          data_envio_aprovacao: string | null
          due_date: string | null
          enterprise_name: string | null
          enviado_por: number | null
          id: number
          installment_number: number | null
          installment_percentage: number | null
          installment_status: string | null
          numero_contrato: string | null
          observacoes: string | null
          payment_operation_type: string | null
          regra_gatilho: string | null
          regra_gatilho_id: number | null
          sienge_id: string
          status_aprovacao: string | null
          total_installments_number: number | null
          unit_name: string | null
          updated_at: string | null
          valor_comissao: number | null
          valor_gatilho: number | null
        }
        Insert: {
          aprovado_por?: number | null
          atingiu_gatilho?: boolean | null
          atualizado_em?: string | null
          bill_number?: number | null
          billing_broker_id?: string | null
          billing_broker_name?: string | null
          block_edit?: boolean | null
          broker_id?: string | null
          broker_nome?: string | null
          building_id?: string | null
          commission_date?: string | null
          commission_released_automatically?: boolean | null
          commission_released_to_be_paid?: boolean | null
          commission_value?: number | null
          company_id?: string | null
          company_name?: string | null
          consider_embedded_interest?: boolean | null
          contract_bill_number?: number | null
          contract_percentage_paid?: number | null
          criado_em?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_situation_type?: string | null
          dados_completos?: Json | null
          data_aprovacao?: string | null
          data_comissao?: string | null
          data_envio_aprovacao?: string | null
          due_date?: string | null
          enterprise_name?: string | null
          enviado_por?: number | null
          id?: number
          installment_number?: number | null
          installment_percentage?: number | null
          installment_status?: string | null
          numero_contrato?: string | null
          observacoes?: string | null
          payment_operation_type?: string | null
          regra_gatilho?: string | null
          regra_gatilho_id?: number | null
          sienge_id: string
          status_aprovacao?: string | null
          total_installments_number?: number | null
          unit_name?: string | null
          updated_at?: string | null
          valor_comissao?: number | null
          valor_gatilho?: number | null
        }
        Update: {
          aprovado_por?: number | null
          atingiu_gatilho?: boolean | null
          atualizado_em?: string | null
          bill_number?: number | null
          billing_broker_id?: string | null
          billing_broker_name?: string | null
          block_edit?: boolean | null
          broker_id?: string | null
          broker_nome?: string | null
          building_id?: string | null
          commission_date?: string | null
          commission_released_automatically?: boolean | null
          commission_released_to_be_paid?: boolean | null
          commission_value?: number | null
          company_id?: string | null
          company_name?: string | null
          consider_embedded_interest?: boolean | null
          contract_bill_number?: number | null
          contract_percentage_paid?: number | null
          criado_em?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_situation_type?: string | null
          dados_completos?: Json | null
          data_aprovacao?: string | null
          data_comissao?: string | null
          data_envio_aprovacao?: string | null
          due_date?: string | null
          enterprise_name?: string | null
          enviado_por?: number | null
          id?: number
          installment_number?: number | null
          installment_percentage?: number | null
          installment_status?: string | null
          numero_contrato?: string | null
          observacoes?: string | null
          payment_operation_type?: string | null
          regra_gatilho?: string | null
          regra_gatilho_id?: number | null
          sienge_id?: string
          status_aprovacao?: string | null
          total_installments_number?: number | null
          unit_name?: string | null
          updated_at?: string | null
          valor_comissao?: number | null
          valor_gatilho?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sienge_comissoes_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "comissoes_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sienge_comissoes_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "comissoes_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sienge_comissoes_regra_gatilho_id_fkey"
            columns: ["regra_gatilho_id"]
            isOneToOne: false
            referencedRelation: "comissoes_regras_gatilho"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes_sienge_contratos: {
        Row: {
          atualizado_em: string | null
          brokers: Json | null
          building_id: string | null
          company_id: string | null
          criado_em: string | null
          customer_id: string | null
          dados_completos: Json | null
          data_contrato: string | null
          id: number
          nome_cliente: string | null
          numero_contrato: string | null
          sienge_id: string
          status: string | null
          unidade: string | null
          unidades: Json | null
          updated_at: string | null
          valor_a_vista: number | null
          valor_total: number | null
        }
        Insert: {
          atualizado_em?: string | null
          brokers?: Json | null
          building_id?: string | null
          company_id?: string | null
          criado_em?: string | null
          customer_id?: string | null
          dados_completos?: Json | null
          data_contrato?: string | null
          id?: number
          nome_cliente?: string | null
          numero_contrato?: string | null
          sienge_id: string
          status?: string | null
          unidade?: string | null
          unidades?: Json | null
          updated_at?: string | null
          valor_a_vista?: number | null
          valor_total?: number | null
        }
        Update: {
          atualizado_em?: string | null
          brokers?: Json | null
          building_id?: string | null
          company_id?: string | null
          criado_em?: string | null
          customer_id?: string | null
          dados_completos?: Json | null
          data_contrato?: string | null
          id?: number
          nome_cliente?: string | null
          numero_contrato?: string | null
          sienge_id?: string
          status?: string | null
          unidade?: string | null
          unidades?: Json | null
          updated_at?: string | null
          valor_a_vista?: number | null
          valor_total?: number | null
        }
        Relationships: []
      }
      comissoes_sienge_corretores: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          broker_flag: string | null
          cadastro_login_em: string | null
          cnpj: string | null
          company_id: string | null
          cpf: string | null
          criado_em: string | null
          dados_completos: Json | null
          email: string | null
          id: number
          nome: string
          nome_comercial: string | null
          nome_social: string | null
          senha_hash: string | null
          sienge_id: string
          telefone: string | null
          ultimo_login: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          broker_flag?: string | null
          cadastro_login_em?: string | null
          cnpj?: string | null
          company_id?: string | null
          cpf?: string | null
          criado_em?: string | null
          dados_completos?: Json | null
          email?: string | null
          id?: number
          nome: string
          nome_comercial?: string | null
          nome_social?: string | null
          senha_hash?: string | null
          sienge_id: string
          telefone?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          broker_flag?: string | null
          cadastro_login_em?: string | null
          cnpj?: string | null
          company_id?: string | null
          cpf?: string | null
          criado_em?: string | null
          dados_completos?: Json | null
          email?: string | null
          id?: number
          nome?: string
          nome_comercial?: string | null
          nome_social?: string | null
          senha_hash?: string | null
          sienge_id?: string
          telefone?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comissoes_sienge_empreendimentos: {
        Row: {
          atualizado_em: string | null
          codigo: string | null
          company_id: number | null
          created_at: string | null
          id: number
          nome: string | null
          sienge_id: number | null
          updated_at: string | null
        }
        Insert: {
          atualizado_em?: string | null
          codigo?: string | null
          company_id?: number | null
          created_at?: string | null
          id?: number
          nome?: string | null
          sienge_id?: number | null
          updated_at?: string | null
        }
        Update: {
          atualizado_em?: string | null
          codigo?: string | null
          company_id?: number | null
          created_at?: string | null
          id?: number
          nome?: string | null
          sienge_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comissoes_sienge_itbi: {
        Row: {
          atualizado_em: string | null
          building_id: string
          company_id: string
          criado_em: string | null
          dados_completos: Json | null
          data_vencimento: string | null
          documento_sienge: string | null
          id: number
          numero_contrato: string
          plano_financeiro: string | null
          updated_at: string | null
          valor_itbi: number | null
        }
        Insert: {
          atualizado_em?: string | null
          building_id: string
          company_id: string
          criado_em?: string | null
          dados_completos?: Json | null
          data_vencimento?: string | null
          documento_sienge?: string | null
          id?: number
          numero_contrato: string
          plano_financeiro?: string | null
          updated_at?: string | null
          valor_itbi?: number | null
        }
        Update: {
          atualizado_em?: string | null
          building_id?: string
          company_id?: string
          criado_em?: string | null
          dados_completos?: Json | null
          data_vencimento?: string | null
          documento_sienge?: string | null
          id?: number
          numero_contrato?: string
          plano_financeiro?: string | null
          updated_at?: string | null
          valor_itbi?: number | null
        }
        Relationships: []
      }
      comissoes_sienge_sync_log: {
        Row: {
          building_id: string | null
          criado_em: string | null
          erros: Json | null
          finalizado_em: string | null
          id: number
          periodo_fim: string | null
          periodo_inicio: string | null
          registros_atualizados: number | null
          registros_inseridos: number | null
          status: string | null
          tipo_sync: string
        }
        Insert: {
          building_id?: string | null
          criado_em?: string | null
          erros?: Json | null
          finalizado_em?: string | null
          id?: number
          periodo_fim?: string | null
          periodo_inicio?: string | null
          registros_atualizados?: number | null
          registros_inseridos?: number | null
          status?: string | null
          tipo_sync: string
        }
        Update: {
          building_id?: string | null
          criado_em?: string | null
          erros?: Json | null
          finalizado_em?: string | null
          id?: number
          periodo_fim?: string | null
          periodo_inicio?: string | null
          registros_atualizados?: number | null
          registros_inseridos?: number | null
          status?: string | null
          tipo_sync?: string
        }
        Relationships: []
      }
      comissoes_sienge_valor_pago: {
        Row: {
          atualizado_em: string | null
          building_id: string
          company_id: string
          criado_em: string | null
          customer_id: string | null
          dados_completos: Json | null
          data_atualizacao: string | null
          id: number
          nome_cliente: string | null
          numero_contrato: string
          updated_at: string | null
          valor_acrescimo: number | null
          valor_bonificacao: number | null
          valor_liquido: number | null
          valor_pago: number | null
        }
        Insert: {
          atualizado_em?: string | null
          building_id: string
          company_id: string
          criado_em?: string | null
          customer_id?: string | null
          dados_completos?: Json | null
          data_atualizacao?: string | null
          id?: number
          nome_cliente?: string | null
          numero_contrato: string
          updated_at?: string | null
          valor_acrescimo?: number | null
          valor_bonificacao?: number | null
          valor_liquido?: number | null
          valor_pago?: number | null
        }
        Update: {
          atualizado_em?: string | null
          building_id?: string
          company_id?: string
          criado_em?: string | null
          customer_id?: string | null
          dados_completos?: Json | null
          data_atualizacao?: string | null
          id?: number
          nome_cliente?: string | null
          numero_contrato?: string
          updated_at?: string | null
          valor_acrescimo?: number | null
          valor_bonificacao?: number | null
          valor_liquido?: number | null
          valor_pago?: number | null
        }
        Relationships: []
      }
      comissoes_sync_logs: {
        Row: {
          criado_em: string | null
          detalhes: Json | null
          duracao_segundos: number | null
          empreendimentos_erro: number | null
          empreendimentos_sucesso: number | null
          empreendimentos_vazio: number | null
          fim: string | null
          id: number
          inicio: string | null
          mensagem: string | null
          rate_limits: number | null
          status: string
          tipo: string
          total_inadimplentes: number | null
          total_registros_inseridos: number | null
          total_requisicoes: number | null
        }
        Insert: {
          criado_em?: string | null
          detalhes?: Json | null
          duracao_segundos?: number | null
          empreendimentos_erro?: number | null
          empreendimentos_sucesso?: number | null
          empreendimentos_vazio?: number | null
          fim?: string | null
          id?: number
          inicio?: string | null
          mensagem?: string | null
          rate_limits?: number | null
          status: string
          tipo?: string
          total_inadimplentes?: number | null
          total_registros_inseridos?: number | null
          total_requisicoes?: number | null
        }
        Update: {
          criado_em?: string | null
          detalhes?: Json | null
          duracao_segundos?: number | null
          empreendimentos_erro?: number | null
          empreendimentos_sucesso?: number | null
          empreendimentos_vazio?: number | null
          fim?: string | null
          id?: number
          inicio?: string | null
          mensagem?: string | null
          rate_limits?: number | null
          status?: string
          tipo?: string
          total_inadimplentes?: number | null
          total_registros_inseridos?: number | null
          total_requisicoes?: number | null
        }
        Relationships: []
      }
      comissoes_usuarios: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          criado_por: string | null
          id: number
          is_admin: boolean | null
          nome_completo: string | null
          password_hash: string
          perfil: string | null
          ultimo_login: string | null
          username: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          criado_por?: string | null
          id?: number
          is_admin?: boolean | null
          nome_completo?: string | null
          password_hash: string
          perfil?: string | null
          ultimo_login?: string | null
          username: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          criado_por?: string | null
          id?: number
          is_admin?: boolean | null
          nome_completo?: string | null
          password_hash?: string
          perfil?: string | null
          ultimo_login?: string | null
          username?: string
        }
        Relationships: []
      }
      comissoes_usuarios_corretores: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          cpf_cnpj: string
          criado_em: string | null
          email: string
          id: number
          nome: string
          senha_hash: string
          sienge_id: string | null
          ultimo_login: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cpf_cnpj: string
          criado_em?: string | null
          email: string
          id?: number
          nome: string
          senha_hash: string
          sienge_id?: string | null
          ultimo_login?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cpf_cnpj?: string
          criado_em?: string | null
          email?: string
          id?: number
          nome?: string
          senha_hash?: string
          sienge_id?: string | null
          ultimo_login?: string | null
        }
        Relationships: []
      }
      contratos_venda: {
        Row: {
          cliente_id: number | null
          data_assinatura: string | null
          empreendimento: string | null
          id: string
          numero: string | null
          status: string | null
          unidade: string | null
          updated_at: string | null
          valor_pago: number | null
          valor_total: number | null
        }
        Insert: {
          cliente_id?: number | null
          data_assinatura?: string | null
          empreendimento?: string | null
          id: string
          numero?: string | null
          status?: string | null
          unidade?: string | null
          updated_at?: string | null
          valor_pago?: number | null
          valor_total?: number | null
        }
        Update: {
          cliente_id?: number | null
          data_assinatura?: string | null
          empreendimento?: string | null
          id?: string
          numero?: string | null
          status?: string | null
          unidade?: string | null
          updated_at?: string | null
          valor_pago?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_venda_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "sienge_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      corretores_externos_sessoes: {
        Row: {
          ativo: boolean | null
          bairro: string | null
          cep: string | null
          chat_id: string | null
          cidade: string | null
          created_at: string
          creci: string | null
          dados_bancarios: string | null
          doc: string | null
          email: string
          endereco: string | null
          nome: string | null
          telefone: string | null
          uf: string | null
        }
        Insert: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          chat_id?: string | null
          cidade?: string | null
          created_at?: string
          creci?: string | null
          dados_bancarios?: string | null
          doc?: string | null
          email: string
          endereco?: string | null
          nome?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Update: {
          ativo?: boolean | null
          bairro?: string | null
          cep?: string | null
          chat_id?: string | null
          cidade?: string | null
          created_at?: string
          creci?: string | null
          dados_bancarios?: string | null
          doc?: string | null
          email?: string
          endereco?: string | null
          nome?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Relationships: []
      }
      crm_consultores: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crm_deal_anotacoes: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          texto: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          texto: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          texto?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_anotacoes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
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
      crm_deal_status_log: {
        Row: {
          created_at: string
          deal_id: string
          empreendimento_id: string | null
          id: string
          responsavel_id: string | null
          status_anterior: string | null
          status_novo: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          empreendimento_id?: string | null
          id?: string
          responsavel_id?: string | null
          status_anterior?: string | null
          status_novo: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          empreendimento_id?: string | null
          id?: string
          responsavel_id?: string | null
          status_anterior?: string | null
          status_novo?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_status_log_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          auto_interesse: string | null
          auto_renda_familiar: string | null
          auto_valor_entrada: number | null
          cidade_cliente: string | null
          cliente_email: string | null
          cliente_nome: string
          consultor_id: string | null
          created_at: string
          data_nascimento: string | null
          data_perdido: string | null
          data_vendido: string | null
          empreendimento_id: string | null
          escolaridade: string | null
          estado_civil: string | null
          filhos: string | null
          fonte_id: string | null
          fonte_original: string | null
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
          payload_raw: Json | null
          preco_lote: number | null
          qualificacao: Database["public"]["Enums"]["crm_qualificacao"]
          rd_deal_id: string | null
          renda_familiar: string | null
          responsavel_id: string | null
          responsavel_venda_corretor_id: string | null
          responsavel_venda_original: string | null
          responsavel_venda_user_id: string | null
          satisfacao_atendimento: number | null
          satisfacao_produto: number | null
          sexo: string | null
          status: Database["public"]["Enums"]["crm_deal_status"]
          tipo_residencia: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          valor_entrada: number | null
          versao_tabela: string | null
        }
        Insert: {
          auto_interesse?: string | null
          auto_renda_familiar?: string | null
          auto_valor_entrada?: number | null
          cidade_cliente?: string | null
          cliente_email?: string | null
          cliente_nome: string
          consultor_id?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_perdido?: string | null
          data_vendido?: string | null
          empreendimento_id?: string | null
          escolaridade?: string | null
          estado_civil?: string | null
          filhos?: string | null
          fonte_id?: string | null
          fonte_original?: string | null
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
          payload_raw?: Json | null
          preco_lote?: number | null
          qualificacao?: Database["public"]["Enums"]["crm_qualificacao"]
          rd_deal_id?: string | null
          renda_familiar?: string | null
          responsavel_id?: string | null
          responsavel_venda_corretor_id?: string | null
          responsavel_venda_original?: string | null
          responsavel_venda_user_id?: string | null
          satisfacao_atendimento?: number | null
          satisfacao_produto?: number | null
          sexo?: string | null
          status?: Database["public"]["Enums"]["crm_deal_status"]
          tipo_residencia?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          valor_entrada?: number | null
          versao_tabela?: string | null
        }
        Update: {
          auto_interesse?: string | null
          auto_renda_familiar?: string | null
          auto_valor_entrada?: number | null
          cidade_cliente?: string | null
          cliente_email?: string | null
          cliente_nome?: string
          consultor_id?: string | null
          created_at?: string
          data_nascimento?: string | null
          data_perdido?: string | null
          data_vendido?: string | null
          empreendimento_id?: string | null
          escolaridade?: string | null
          estado_civil?: string | null
          filhos?: string | null
          fonte_id?: string | null
          fonte_original?: string | null
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
          payload_raw?: Json | null
          preco_lote?: number | null
          qualificacao?: Database["public"]["Enums"]["crm_qualificacao"]
          rd_deal_id?: string | null
          renda_familiar?: string | null
          responsavel_id?: string | null
          responsavel_venda_corretor_id?: string | null
          responsavel_venda_original?: string | null
          responsavel_venda_user_id?: string | null
          satisfacao_atendimento?: number | null
          satisfacao_produto?: number | null
          sexo?: string | null
          status?: Database["public"]["Enums"]["crm_deal_status"]
          tipo_residencia?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          valor_entrada?: number | null
          versao_tabela?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "crm_consultores"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "crm_deals_responsavel_venda_corretor_id_fkey"
            columns: ["responsavel_venda_corretor_id"]
            isOneToOne: false
            referencedRelation: "comercial_corretores"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals_checklist: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          label: string
          ordem: number
          rd_custom_field_id: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          label: string
          ordem?: number
          rd_custom_field_id?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          label?: string
          ordem?: number
          rd_custom_field_id?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_checklist_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_empreendimentos: {
        Row: {
          ativo: boolean
          cidade: string
          codigo: string | null
          codigo_interno: string | null
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cidade?: string
          codigo?: string | null
          codigo_interno?: string | null
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cidade?: string
          codigo?: string | null
          codigo_interno?: string | null
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
      crm_formulario_historico_dados: {
        Row: {
          "Carimbo de data/hora": string | null
          "De 0 a 10_1, qual a probabilidade de você indicar o Empreendim":
            | number
            | null
          "De 0 a 10, qual a probabilidade de você indicar a YOUNG a um a":
            | number
            | null
          "Em qual empreendimento você adquiriu seu terreno?": string | null
          Email: string | null
          "Há quanto tempo mora no seu endereço atual?": string | null
          "Marque seus principais interesses": string | null
          Mídiamotivadoradaaquisição: string | null
          Nacionalidade: string | null
          Profissão: string | null
          "Qual a cidade onde reside?": string | null
          "Qual faixa melhor se aproxima da sua renda familiar mensal?":
            | string
            | null
          "Qual o motivo principal da compra?": string | null
          "Qual o seu endereço atual?": string | null
          "Qual o seu estado civil?": string | null
          "Qual o seu nível de escolaridade?": string | null
          "Qual o seu nome completo?": string | null
          "Qual o seu tipo de residência?": string | null
          "Qual sua data de nascimento?": string | null
          "Quantos lotes você adquiriu?": string | null
          Sexo: string | null
          "Sugestões, elogios ou reclamações": string | null
          Telefone: string | null
          "Você possui filhos? Quantos?": string | null
        }
        Insert: {
          "Carimbo de data/hora"?: string | null
          "De 0 a 10_1, qual a probabilidade de você indicar o Empreendim"?:
            | number
            | null
          "De 0 a 10, qual a probabilidade de você indicar a YOUNG a um a"?:
            | number
            | null
          "Em qual empreendimento você adquiriu seu terreno?"?: string | null
          Email?: string | null
          "Há quanto tempo mora no seu endereço atual?"?: string | null
          "Marque seus principais interesses"?: string | null
          Mídiamotivadoradaaquisição?: string | null
          Nacionalidade?: string | null
          Profissão?: string | null
          "Qual a cidade onde reside?"?: string | null
          "Qual faixa melhor se aproxima da sua renda familiar mensal?"?:
            | string
            | null
          "Qual o motivo principal da compra?"?: string | null
          "Qual o seu endereço atual?"?: string | null
          "Qual o seu estado civil?"?: string | null
          "Qual o seu nível de escolaridade?"?: string | null
          "Qual o seu nome completo?"?: string | null
          "Qual o seu tipo de residência?"?: string | null
          "Qual sua data de nascimento?"?: string | null
          "Quantos lotes você adquiriu?"?: string | null
          Sexo?: string | null
          "Sugestões, elogios ou reclamações"?: string | null
          Telefone?: string | null
          "Você possui filhos? Quantos?"?: string | null
        }
        Update: {
          "Carimbo de data/hora"?: string | null
          "De 0 a 10_1, qual a probabilidade de você indicar o Empreendim"?:
            | number
            | null
          "De 0 a 10, qual a probabilidade de você indicar a YOUNG a um a"?:
            | number
            | null
          "Em qual empreendimento você adquiriu seu terreno?"?: string | null
          Email?: string | null
          "Há quanto tempo mora no seu endereço atual?"?: string | null
          "Marque seus principais interesses"?: string | null
          Mídiamotivadoradaaquisição?: string | null
          Nacionalidade?: string | null
          Profissão?: string | null
          "Qual a cidade onde reside?"?: string | null
          "Qual faixa melhor se aproxima da sua renda familiar mensal?"?:
            | string
            | null
          "Qual o motivo principal da compra?"?: string | null
          "Qual o seu endereço atual?"?: string | null
          "Qual o seu estado civil?"?: string | null
          "Qual o seu nível de escolaridade?"?: string | null
          "Qual o seu nome completo?"?: string | null
          "Qual o seu tipo de residência?"?: string | null
          "Qual sua data de nascimento?"?: string | null
          "Quantos lotes você adquiriu?"?: string | null
          Sexo?: string | null
          "Sugestões, elogios ou reclamações"?: string | null
          Telefone?: string | null
          "Você possui filhos? Quantos?"?: string | null
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
      crm_rd_user_map: {
        Row: {
          ativo: boolean
          consultor_id: string
          created_at: string
          rd_user_email: string | null
          rd_user_id: string
          rd_user_name: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          consultor_id: string
          created_at?: string
          rd_user_email?: string | null
          rd_user_id: string
          rd_user_name: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          consultor_id?: string
          created_at?: string
          rd_user_email?: string | null
          rd_user_id?: string
          rd_user_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_rd_user_map_consultor_id_fkey"
            columns: ["consultor_id"]
            isOneToOne: false
            referencedRelation: "crm_consultores"
            referencedColumns: ["id"]
          },
        ]
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
          concluida_em: string | null
          created_at: string
          data_vencimento: string | null
          deal_id: string
          deleted_at: string | null
          descricao: string | null
          hora_vencimento: string | null
          id: string
          responsavel_id: string
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          concluida?: boolean
          concluida_em?: string | null
          created_at?: string
          data_vencimento?: string | null
          deal_id: string
          deleted_at?: string | null
          descricao?: string | null
          hora_vencimento?: string | null
          id?: string
          responsavel_id: string
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          concluida?: boolean
          concluida_em?: string | null
          created_at?: string
          data_vencimento?: string | null
          deal_id?: string
          deleted_at?: string | null
          descricao?: string | null
          hora_vencimento?: string | null
          id?: string
          responsavel_id?: string
          tipo?: string | null
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
      dashboard_comunicados: {
        Row: {
          autor_id: string
          autor_nome: string
          conteudo: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          autor_id: string
          autor_nome?: string
          conteudo: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          autor_id?: string
          autor_nome?: string
          conteudo?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
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
      esquadro_comentarios_pauta: {
        Row: {
          conteudo: string
          created_at: string
          fixado: boolean
          id: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          fixado?: boolean
          id?: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          fixado?: boolean
          id?: string
          user_id?: string
        }
        Relationships: []
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
          data_conclusao: string | null
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
          data_conclusao?: string | null
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
          data_conclusao?: string | null
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
      esquadro_relatorios_config: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          destinatarios: Json | null
          frequencia: string | null
          horario: string | null
          id: string
          nome: string
          ultimo_envio: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          destinatarios?: Json | null
          frequencia?: string | null
          horario?: string | null
          id?: string
          nome: string
          ultimo_envio?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          destinatarios?: Json | null
          frequencia?: string | null
          horario?: string | null
          id?: string
          nome?: string
          ultimo_envio?: string | null
        }
        Relationships: []
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
      financeiro_receber: {
        Row: {
          cliente_id: number | null
          contrato_id: string | null
          data_pagamento: string | null
          id: string
          numero_titulo: string | null
          parcela: number | null
          status: string | null
          updated_at: string | null
          valor: number | null
          vencimento: string | null
        }
        Insert: {
          cliente_id?: number | null
          contrato_id?: string | null
          data_pagamento?: string | null
          id: string
          numero_titulo?: string | null
          parcela?: number | null
          status?: string | null
          updated_at?: string | null
          valor?: number | null
          vencimento?: string | null
        }
        Update: {
          cliente_id?: number | null
          contrato_id?: string | null
          data_pagamento?: string | null
          id?: string
          numero_titulo?: string | null
          parcela?: number | null
          status?: string | null
          updated_at?: string | null
          valor?: number | null
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_receber_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "sienge_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_receber_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_venda"
            referencedColumns: ["id"]
          },
        ]
      }
      frota_abastecimentos: {
        Row: {
          created_at: string | null
          data: string | null
          id: string
          litros: number | null
          placa: string
          updated_at: string | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          id?: string
          litros?: number | null
          placa: string
          updated_at?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          created_at?: string | null
          data?: string | null
          id?: string
          litros?: number | null
          placa?: string
          updated_at?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: []
      }
      frota_manutencoes: {
        Row: {
          created_at: string | null
          data: string | null
          descricao: string | null
          id: string
          mecanico: string | null
          placa: string
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          mecanico?: string | null
          placa: string
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          mecanico?: string | null
          placa?: string
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      frota_revisoes: {
        Row: {
          created_at: string | null
          data_ultima_manutencao: string | null
          id: string
          item_servico: string
          periodicidade_km: number | null
          placa: string
          ultima_manutencao_km: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_ultima_manutencao?: string | null
          id?: string
          item_servico: string
          periodicidade_km?: number | null
          placa: string
          ultima_manutencao_km?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_ultima_manutencao?: string | null
          id?: string
          item_servico?: string
          periodicidade_km?: number | null
          placa?: string
          ultima_manutencao_km?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      frota_seguros: {
        Row: {
          corretora: string | null
          created_at: string | null
          id: string
          placa: string
          seguradora: string | null
          updated_at: string | null
          url_apolice: string | null
          valor_seguro: number | null
          vencimento: string | null
        }
        Insert: {
          corretora?: string | null
          created_at?: string | null
          id?: string
          placa: string
          seguradora?: string | null
          updated_at?: string | null
          url_apolice?: string | null
          valor_seguro?: number | null
          vencimento?: string | null
        }
        Update: {
          corretora?: string | null
          created_at?: string | null
          id?: string
          placa?: string
          seguradora?: string | null
          updated_at?: string | null
          url_apolice?: string | null
          valor_seguro?: number | null
          vencimento?: string | null
        }
        Relationships: []
      }
      frota_sinistros: {
        Row: {
          bo: string | null
          created_at: string | null
          data: string | null
          descricao: string | null
          id: string
          placa: string
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          bo?: string | null
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          placa: string
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          bo?: string | null
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          placa?: string
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      frota_veiculos: {
        Row: {
          ano_modelo: string | null
          created_at: string | null
          dpvat: number | null
          id: string
          ipva: number | null
          modelo: string | null
          ordem: number | null
          placa: string
          proprietario: string | null
          renavam: string | null
          updated_at: string | null
        }
        Insert: {
          ano_modelo?: string | null
          created_at?: string | null
          dpvat?: number | null
          id?: string
          ipva?: number | null
          modelo?: string | null
          ordem?: number | null
          placa: string
          proprietario?: string | null
          renavam?: string | null
          updated_at?: string | null
        }
        Update: {
          ano_modelo?: string | null
          created_at?: string | null
          dpvat?: number | null
          id?: string
          ipva?: number | null
          modelo?: string | null
          ordem?: number | null
          placa?: string
          proprietario?: string | null
          renavam?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      frota_veiculos_km: {
        Row: {
          created_at: string | null
          data_atualizacao: string | null
          id: string
          km_atual: number | null
          placa: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_atualizacao?: string | null
          id?: string
          km_atual?: number | null
          placa: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_atualizacao?: string | null
          id?: string
          km_atual?: number | null
          placa?: string
          updated_at?: string | null
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
          tipo_arquivo_id: string | null
        }
        Insert: {
          arquivo: string
          created_at?: string
          created_by?: string | null
          gleba_id: string
          id?: string
          nome_arquivo: string
          tipo: Database["public"]["Enums"]["tipo_anexo_gleba"]
          tipo_arquivo_id?: string | null
        }
        Update: {
          arquivo?: string
          created_at?: string
          created_by?: string | null
          gleba_id?: string
          id?: string
          nome_arquivo?: string
          tipo?: Database["public"]["Enums"]["tipo_anexo_gleba"]
          tipo_arquivo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gleba_anexos_gleba_id_fkey"
            columns: ["gleba_id"]
            isOneToOne: false
            referencedRelation: "glebas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gleba_anexos_tipo_arquivo_id_fkey"
            columns: ["tipo_arquivo_id"]
            isOneToOne: false
            referencedRelation: "tipos_arquivo"
            referencedColumns: ["id"]
          },
        ]
      }
      gleba_status_descricoes: {
        Row: {
          descricao: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          descricao?: string
          status: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          descricao?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
          google_drive_folder_id: string | null
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
          google_drive_folder_id?: string | null
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
          google_drive_folder_id?: string | null
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
          ativo: boolean
          contato_nome: string | null
          created_at: string
          id: string
          link_social: string | null
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          contato_nome?: string | null
          created_at?: string
          id?: string
          link_social?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
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
      paver_dependency_rules: {
        Row: {
          created_at: string
          created_by: string
          id: string
          obra_id: string
          predecessor: string
          successor: string
          tipo: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          obra_id: string
          predecessor: string
          successor: string
          tipo: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          obra_id?: string
          predecessor?: string
          successor?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "paver_dependency_rules_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "paver_obras"
            referencedColumns: ["id"]
          },
        ]
      }
      paver_diario_atividades: {
        Row: {
          avanco_percentual: number
          created_at: string | null
          diario_id: string
          eap_item_id: string
          id: string
          quantidade_dia: number
        }
        Insert: {
          avanco_percentual?: number
          created_at?: string | null
          diario_id: string
          eap_item_id: string
          id?: string
          quantidade_dia?: number
        }
        Update: {
          avanco_percentual?: number
          created_at?: string | null
          diario_id?: string
          eap_item_id?: string
          id?: string
          quantidade_dia?: number
        }
        Relationships: [
          {
            foreignKeyName: "paver_diario_atividades_diario_id_fkey"
            columns: ["diario_id"]
            isOneToOne: false
            referencedRelation: "paver_diarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paver_diario_atividades_eap_item_id_fkey"
            columns: ["eap_item_id"]
            isOneToOne: false
            referencedRelation: "paver_eap_items"
            referencedColumns: ["id"]
          },
        ]
      }
      paver_diarios: {
        Row: {
          atividades: string
          clima: string
          clima_manha: string
          clima_tarde: string
          created_at: string | null
          created_by: string
          data: string
          fotos: string[] | null
          id: string
          mao_de_obra: string | null
          obra_id: string
          observacoes: string | null
          temperatura_max: number | null
          temperatura_min: number | null
        }
        Insert: {
          atividades: string
          clima?: string
          clima_manha?: string
          clima_tarde?: string
          created_at?: string | null
          created_by: string
          data: string
          fotos?: string[] | null
          id?: string
          mao_de_obra?: string | null
          obra_id: string
          observacoes?: string | null
          temperatura_max?: number | null
          temperatura_min?: number | null
        }
        Update: {
          atividades?: string
          clima?: string
          clima_manha?: string
          clima_tarde?: string
          created_at?: string | null
          created_by?: string
          data?: string
          fotos?: string[] | null
          id?: string
          mao_de_obra?: string | null
          obra_id?: string
          observacoes?: string | null
          temperatura_max?: number | null
          temperatura_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "paver_diarios_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "paver_obras"
            referencedColumns: ["id"]
          },
        ]
      }
      paver_eap_baseline_items: {
        Row: {
          avanco_previsto: number | null
          baseline_id: string
          created_at: string | null
          data_fim_prevista: string | null
          data_inicio_prevista: string | null
          eap_item_id: string
          id: string
        }
        Insert: {
          avanco_previsto?: number | null
          baseline_id: string
          created_at?: string | null
          data_fim_prevista?: string | null
          data_inicio_prevista?: string | null
          eap_item_id: string
          id?: string
        }
        Update: {
          avanco_previsto?: number | null
          baseline_id?: string
          created_at?: string | null
          data_fim_prevista?: string | null
          data_inicio_prevista?: string | null
          eap_item_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paver_eap_baseline_items_baseline_id_fkey"
            columns: ["baseline_id"]
            isOneToOne: false
            referencedRelation: "paver_eap_baselines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paver_eap_baseline_items_eap_item_id_fkey"
            columns: ["eap_item_id"]
            isOneToOne: false
            referencedRelation: "paver_eap_items"
            referencedColumns: ["id"]
          },
        ]
      }
      paver_eap_baselines: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          nome: string
          obra_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          nome: string
          obra_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          nome?: string
          obra_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paver_eap_baselines_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "paver_obras"
            referencedColumns: ["id"]
          },
        ]
      }
      paver_eap_items: {
        Row: {
          avanco_base: number | null
          avanco_previsto: number | null
          avanco_realizado: number | null
          classificacao_adicional: string | null
          codigo: string | null
          created_at: string | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio_prevista: string | null
          data_inicio_real: string | null
          descricao: string
          id: string
          lote: string | null
          obra_id: string
          ordem: number | null
          pacote: string | null
          parent_id: string | null
          predecessoras: string[] | null
          quantidade: number | null
          sucessoras: string[] | null
          tag_id: string | null
          tipo: string
          unidade: string | null
        }
        Insert: {
          avanco_base?: number | null
          avanco_previsto?: number | null
          avanco_realizado?: number | null
          classificacao_adicional?: string | null
          codigo?: string | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          descricao: string
          id?: string
          lote?: string | null
          obra_id: string
          ordem?: number | null
          pacote?: string | null
          parent_id?: string | null
          predecessoras?: string[] | null
          quantidade?: number | null
          sucessoras?: string[] | null
          tag_id?: string | null
          tipo?: string
          unidade?: string | null
        }
        Update: {
          avanco_base?: number | null
          avanco_previsto?: number | null
          avanco_realizado?: number | null
          classificacao_adicional?: string | null
          codigo?: string | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio_prevista?: string | null
          data_inicio_real?: string | null
          descricao?: string
          id?: string
          lote?: string | null
          obra_id?: string
          ordem?: number | null
          pacote?: string | null
          parent_id?: string | null
          predecessoras?: string[] | null
          quantidade?: number | null
          sucessoras?: string[] | null
          tag_id?: string | null
          tipo?: string
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paver_eap_items_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "paver_obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paver_eap_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "paver_eap_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paver_eap_items_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "paver_service_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      paver_fotos_localizadas: {
        Row: {
          created_at: string | null
          created_by: string
          descricao: string | null
          diario_id: string | null
          foto_url: string
          id: string
          obra_id: string
          pacote: string | null
          planta_id: string
          pos_x: number
          pos_y: number
          tipo_servico: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          descricao?: string | null
          diario_id?: string | null
          foto_url: string
          id?: string
          obra_id: string
          pacote?: string | null
          planta_id: string
          pos_x: number
          pos_y: number
          tipo_servico?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          descricao?: string | null
          diario_id?: string | null
          foto_url?: string
          id?: string
          obra_id?: string
          pacote?: string | null
          planta_id?: string
          pos_x?: number
          pos_y?: number
          tipo_servico?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paver_fotos_localizadas_diario_id_fkey"
            columns: ["diario_id"]
            isOneToOne: false
            referencedRelation: "paver_diarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paver_fotos_localizadas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "paver_obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paver_fotos_localizadas_planta_id_fkey"
            columns: ["planta_id"]
            isOneToOne: false
            referencedRelation: "paver_plantas"
            referencedColumns: ["id"]
          },
        ]
      }
      paver_obras: {
        Row: {
          cidade: string | null
          created_at: string | null
          created_by: string
          data_inicio: string | null
          data_previsao: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          responsavel_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string | null
          created_by: string
          data_inicio?: string | null
          data_previsao?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          responsavel_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string | null
          created_by?: string
          data_inicio?: string | null
          data_previsao?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          responsavel_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      paver_orcamento_itens: {
        Row: {
          codigo: string
          codigo_pai_n1: string | null
          codigo_pai_n2: string | null
          codigo_pai_n3: string | null
          created_at: string
          descricao: string
          id: string
          nivel: number
          obra_id: string
          orcamento_id: string
          ordem: number
          pacote_trabalho: string | null
          preco_total: number
          preco_unitario: number
          quantidade: number
          tipo_servico: string | null
          unidade: string | null
        }
        Insert: {
          codigo: string
          codigo_pai_n1?: string | null
          codigo_pai_n2?: string | null
          codigo_pai_n3?: string | null
          created_at?: string
          descricao: string
          id?: string
          nivel?: number
          obra_id: string
          orcamento_id: string
          ordem?: number
          pacote_trabalho?: string | null
          preco_total?: number
          preco_unitario?: number
          quantidade?: number
          tipo_servico?: string | null
          unidade?: string | null
        }
        Update: {
          codigo?: string
          codigo_pai_n1?: string | null
          codigo_pai_n2?: string | null
          codigo_pai_n3?: string | null
          created_at?: string
          descricao?: string
          id?: string
          nivel?: number
          obra_id?: string
          orcamento_id?: string
          ordem?: number
          pacote_trabalho?: string | null
          preco_total?: number
          preco_unitario?: number
          quantidade?: number
          tipo_servico?: string | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paver_orcamento_itens_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "paver_obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paver_orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "paver_orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      paver_orcamentos: {
        Row: {
          arquivo_url: string | null
          created_at: string
          created_by: string
          id: string
          nome_arquivo: string | null
          obra_id: string
          total_itens: number
          valor_total: number
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          created_by: string
          id?: string
          nome_arquivo?: string | null
          obra_id: string
          total_itens?: number
          valor_total?: number
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          created_by?: string
          id?: string
          nome_arquivo?: string | null
          obra_id?: string
          total_itens?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "paver_orcamentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "paver_obras"
            referencedColumns: ["id"]
          },
        ]
      }
      paver_plantas: {
        Row: {
          created_at: string | null
          id: string
          imagem_url: string
          nome: string
          obra_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          imagem_url: string
          nome: string
          obra_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          imagem_url?: string
          nome?: string
          obra_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paver_plantas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "paver_obras"
            referencedColumns: ["id"]
          },
        ]
      }
      paver_profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      paver_service_tags: {
        Row: {
          created_at: string
          id: string
          nome: string
          unidade_permitida: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          unidade_permitida: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          unidade_permitida?: string
        }
        Relationships: []
      }
      paver_user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["paver_app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["paver_app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["paver_app_role"]
          user_id?: string
        }
        Relationships: []
      }
      pesquisa_mercado_terrenos: {
        Row: {
          condicoes_pagamento: string | null
          created_at: string | null
          id: string
          imagem_url: string | null
          latitude: number | null
          longitude: number | null
          nome: string
          observacoes: string | null
          pesquisa_id: string
          placemark_name: string | null
          preco: number | null
          tamanho_m2: number | null
          tipo_terreno: string | null
          url_anuncio: string | null
        }
        Insert: {
          condicoes_pagamento?: string | null
          created_at?: string | null
          id?: string
          imagem_url?: string | null
          latitude?: number | null
          longitude?: number | null
          nome: string
          observacoes?: string | null
          pesquisa_id: string
          placemark_name?: string | null
          preco?: number | null
          tamanho_m2?: number | null
          tipo_terreno?: string | null
          url_anuncio?: string | null
        }
        Update: {
          condicoes_pagamento?: string | null
          created_at?: string | null
          id?: string
          imagem_url?: string | null
          latitude?: number | null
          longitude?: number | null
          nome?: string
          observacoes?: string | null
          pesquisa_id?: string
          placemark_name?: string | null
          preco?: number | null
          tamanho_m2?: number | null
          tipo_terreno?: string | null
          url_anuncio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pesquisa_mercado_terrenos_pesquisa_id_fkey"
            columns: ["pesquisa_id"]
            isOneToOne: false
            referencedRelation: "pesquisas_mercado"
            referencedColumns: ["id"]
          },
        ]
      }
      pesquisas_mercado: {
        Row: {
          cidade_id: string | null
          created_at: string | null
          created_by: string | null
          data_pesquisa: string
          id: string
          kmz_file: string | null
          nome: string
          observacoes: string | null
        }
        Insert: {
          cidade_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_pesquisa?: string
          id?: string
          kmz_file?: string | null
          nome: string
          observacoes?: string | null
        }
        Update: {
          cidade_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_pesquisa?: string
          id?: string
          kmz_file?: string | null
          nome?: string
          observacoes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pesquisas_mercado_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_alteracao_campo: {
        Row: {
          campo: string
          data_alteracao: string | null
          id: number
          registro_id: number
          tabela: string
          usuario_id: number | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          campo: string
          data_alteracao?: string | null
          id?: number
          registro_id: number
          tabela: string
          usuario_id?: number | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          campo?: string
          data_alteracao?: string | null
          id?: number
          registro_id?: number
          tabela?: string
          usuario_id?: number | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_alteracao_campo_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_conferencia_escritura: {
        Row: {
          aditivo_assinado_url: string | null
          agendamento_assinatura: string | null
          aprovacao: string | null
          area_bate_contrato: string | null
          cliente: string | null
          conferencia_aditivos: string | null
          conferencia_renegociacoes: string | null
          conjuge_bate_contrato: string | null
          contrato_url: string | null
          criado_por_id: number | null
          data_solicitacao: string | null
          desistencia: boolean | null
          empreendimento: string | null
          id: number
          indexador_bate_contrato: string | null
          lote_bate_contrato: string | null
          matricula_averbada_url: string | null
          matricula_bate_contrato: string | null
          minuta_escritura_url: string | null
          numero_lote: string | null
          onus_constam: string | null
          preco_lote_correto: string | null
          qualificacao_cliente_bate_contrato: string | null
          relatorio_aditivos_sienge_url: string | null
          relatorio_contas_a_receber_url: string | null
          relatorio_contas_recebidas_url: string | null
          responsavel_interno: string | null
          status: string | null
          tipo_escritura: string | null
          valores_pagos_recebidos: string | null
        }
        Insert: {
          aditivo_assinado_url?: string | null
          agendamento_assinatura?: string | null
          aprovacao?: string | null
          area_bate_contrato?: string | null
          cliente?: string | null
          conferencia_aditivos?: string | null
          conferencia_renegociacoes?: string | null
          conjuge_bate_contrato?: string | null
          contrato_url?: string | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          indexador_bate_contrato?: string | null
          lote_bate_contrato?: string | null
          matricula_averbada_url?: string | null
          matricula_bate_contrato?: string | null
          minuta_escritura_url?: string | null
          numero_lote?: string | null
          onus_constam?: string | null
          preco_lote_correto?: string | null
          qualificacao_cliente_bate_contrato?: string | null
          relatorio_aditivos_sienge_url?: string | null
          relatorio_contas_a_receber_url?: string | null
          relatorio_contas_recebidas_url?: string | null
          responsavel_interno?: string | null
          status?: string | null
          tipo_escritura?: string | null
          valores_pagos_recebidos?: string | null
        }
        Update: {
          aditivo_assinado_url?: string | null
          agendamento_assinatura?: string | null
          aprovacao?: string | null
          area_bate_contrato?: string | null
          cliente?: string | null
          conferencia_aditivos?: string | null
          conferencia_renegociacoes?: string | null
          conjuge_bate_contrato?: string | null
          contrato_url?: string | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          indexador_bate_contrato?: string | null
          lote_bate_contrato?: string | null
          matricula_averbada_url?: string | null
          matricula_bate_contrato?: string | null
          minuta_escritura_url?: string | null
          numero_lote?: string | null
          onus_constam?: string | null
          preco_lote_correto?: string | null
          qualificacao_cliente_bate_contrato?: string | null
          relatorio_aditivos_sienge_url?: string | null
          relatorio_contas_a_receber_url?: string | null
          relatorio_contas_recebidas_url?: string | null
          responsavel_interno?: string | null
          status?: string | null
          tipo_escritura?: string | null
          valores_pagos_recebidos?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_conferencia_escritura_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_configuracao_opcao: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          id: number
          ordem: number | null
          updated_at: string | null
          valor: string
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          id?: number
          ordem?: number | null
          updated_at?: string | null
          valor: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          id?: number
          ordem?: number | null
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      posvenda_contrato_caixa: {
        Row: {
          aprovacao_financeiro: string | null
          aprovacao_geral: string | null
          assinatura_cef_data: string | null
          assinatura_contrato_data: string | null
          calculo_desconto: number | null
          comprovante_url: string | null
          contrato_caixa_url: string | null
          contratos_internos_url: string | null
          cpf: string | null
          criado_por_id: number | null
          empreendimento: string | null
          id: number
          imobiliaria: string | null
          lote: string | null
          nome_cliente: string | null
          observacoes: string | null
          saldo_a_pagar_url: string | null
          saldo_ccd: number | null
          status: string | null
          tipo_contrato: string | null
          valor_atualizado: number | null
          valor_contrato: number | null
          valor_financiamento: number | null
          valores_pagos_url: string | null
          vencimento_data: string | null
        }
        Insert: {
          aprovacao_financeiro?: string | null
          aprovacao_geral?: string | null
          assinatura_cef_data?: string | null
          assinatura_contrato_data?: string | null
          calculo_desconto?: number | null
          comprovante_url?: string | null
          contrato_caixa_url?: string | null
          contratos_internos_url?: string | null
          cpf?: string | null
          criado_por_id?: number | null
          empreendimento?: string | null
          id?: number
          imobiliaria?: string | null
          lote?: string | null
          nome_cliente?: string | null
          observacoes?: string | null
          saldo_a_pagar_url?: string | null
          saldo_ccd?: number | null
          status?: string | null
          tipo_contrato?: string | null
          valor_atualizado?: number | null
          valor_contrato?: number | null
          valor_financiamento?: number | null
          valores_pagos_url?: string | null
          vencimento_data?: string | null
        }
        Update: {
          aprovacao_financeiro?: string | null
          aprovacao_geral?: string | null
          assinatura_cef_data?: string | null
          assinatura_contrato_data?: string | null
          calculo_desconto?: number | null
          comprovante_url?: string | null
          contrato_caixa_url?: string | null
          contratos_internos_url?: string | null
          cpf?: string | null
          criado_por_id?: number | null
          empreendimento?: string | null
          id?: number
          imobiliaria?: string | null
          lote?: string | null
          nome_cliente?: string | null
          observacoes?: string | null
          saldo_a_pagar_url?: string | null
          saldo_ccd?: number | null
          status?: string | null
          tipo_contrato?: string | null
          valor_atualizado?: number | null
          valor_contrato?: number | null
          valor_financiamento?: number | null
          valores_pagos_url?: string | null
          vencimento_data?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_contrato_caixa_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_distrato_nao_registrado: {
        Row: {
          altera_sienge: boolean | null
          aprovacao_geral: string | null
          aprovacao_inicial_distrato_por: string | null
          aprovacao_minuta_distrato_por: string | null
          criado_por_id: number | null
          data_solicitacao: string | null
          debito_condominio_assoc: number | null
          debito_iptu: number | null
          debitos_pagos: boolean | null
          desistencia_do_distrato: boolean | null
          empreendimento: string | null
          id: number
          id_helpdesk: string | null
          lanca_devolucoes_sienge: boolean | null
          link_calculo_distrato: string | null
          link_contrato_original: string | null
          link_distrato_assinado: string | null
          link_minuta_distrato: string | null
          motivo: string | null
          nome_cliente: string | null
          numero_lote: string | null
          status: string | null
        }
        Insert: {
          altera_sienge?: boolean | null
          aprovacao_geral?: string | null
          aprovacao_inicial_distrato_por?: string | null
          aprovacao_minuta_distrato_por?: string | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          debito_condominio_assoc?: number | null
          debito_iptu?: number | null
          debitos_pagos?: boolean | null
          desistencia_do_distrato?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          lanca_devolucoes_sienge?: boolean | null
          link_calculo_distrato?: string | null
          link_contrato_original?: string | null
          link_distrato_assinado?: string | null
          link_minuta_distrato?: string | null
          motivo?: string | null
          nome_cliente?: string | null
          numero_lote?: string | null
          status?: string | null
        }
        Update: {
          altera_sienge?: boolean | null
          aprovacao_geral?: string | null
          aprovacao_inicial_distrato_por?: string | null
          aprovacao_minuta_distrato_por?: string | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          debito_condominio_assoc?: number | null
          debito_iptu?: number | null
          debitos_pagos?: boolean | null
          desistencia_do_distrato?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          lanca_devolucoes_sienge?: boolean | null
          link_calculo_distrato?: string | null
          link_contrato_original?: string | null
          link_distrato_assinado?: string | null
          link_minuta_distrato?: string | null
          motivo?: string | null
          nome_cliente?: string | null
          numero_lote?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_distrato_nao_registrado_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_distrato_registrado: {
        Row: {
          altera_sienge: boolean | null
          aprovacao_distrato_inicial_por: string | null
          aprovacao_minutas_finais_por: string | null
          atualiza_estoque_legal: boolean | null
          criado_por_id: number | null
          data_solicitacao: string | null
          debito_condominio_assoc: number | null
          debito_iptu: number | null
          debitos_pagos: boolean | null
          desistencia_do_processo: boolean | null
          empreendimento: string | null
          id: number
          id_helpdesk: string | null
          lanca_devolucoes_sienge: boolean | null
          link_calculo_distrato: string | null
          link_contrato_distratado: string | null
          link_escritura_distrato_assinada: string | null
          link_matricula_cancelada_averbada: string | null
          link_minuta_escritura_distrato: string | null
          link_minuta_procuracao: string | null
          link_valores_pagos_cliente: string | null
          motivo: string | null
          nome_cliente: string | null
          numero_lote: string | null
          status: string | null
        }
        Insert: {
          altera_sienge?: boolean | null
          aprovacao_distrato_inicial_por?: string | null
          aprovacao_minutas_finais_por?: string | null
          atualiza_estoque_legal?: boolean | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          debito_condominio_assoc?: number | null
          debito_iptu?: number | null
          debitos_pagos?: boolean | null
          desistencia_do_processo?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          lanca_devolucoes_sienge?: boolean | null
          link_calculo_distrato?: string | null
          link_contrato_distratado?: string | null
          link_escritura_distrato_assinada?: string | null
          link_matricula_cancelada_averbada?: string | null
          link_minuta_escritura_distrato?: string | null
          link_minuta_procuracao?: string | null
          link_valores_pagos_cliente?: string | null
          motivo?: string | null
          nome_cliente?: string | null
          numero_lote?: string | null
          status?: string | null
        }
        Update: {
          altera_sienge?: boolean | null
          aprovacao_distrato_inicial_por?: string | null
          aprovacao_minutas_finais_por?: string | null
          atualiza_estoque_legal?: boolean | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          debito_condominio_assoc?: number | null
          debito_iptu?: number | null
          debitos_pagos?: boolean | null
          desistencia_do_processo?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          lanca_devolucoes_sienge?: boolean | null
          link_calculo_distrato?: string | null
          link_contrato_distratado?: string | null
          link_escritura_distrato_assinada?: string | null
          link_matricula_cancelada_averbada?: string | null
          link_minuta_escritura_distrato?: string | null
          link_minuta_procuracao?: string | null
          link_valores_pagos_cliente?: string | null
          motivo?: string | null
          nome_cliente?: string | null
          numero_lote?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_distrato_registrado_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_leilao: {
        Row: {
          aprovacao_direcao: string | null
          arrematado_leilao1: string | null
          arrematado_leilao2: string | null
          averbacao_ata_url: string | null
          boletos_cancelados: string | null
          certidao_nao_purgacao_mora_2_url: string | null
          certidao_nao_purgacao_mora_url: string | null
          ciente_direcao: string | null
          cliente: string | null
          comprovante_devolucao_url: string | null
          consta_iptu_condominio_edital: string | null
          contas_a_receber_url: string | null
          contas_recebidas_url: string | null
          contrato_url: string | null
          criado_por_id: number | null
          custo_consolidacao_ri: number | null
          custo_intimacao_edital: number | null
          custo_intimacao_ri: number | null
          custo_itbi: number | null
          custo_notificacao_leilao_correio: number | null
          custo_publicacao_edital_intimacao: number | null
          custo_publicacao_edital_leilao: number | null
          data_consolidacao: string | null
          data_inicio_anuncio: string | null
          data_leilao1: string | null
          data_leilao2: string | null
          data_limite_leilao1: string | null
          empreendimento: string | null
          guia_consolidacao_url: string | null
          id: number
          id_appsheet_consolidacao: string | null
          id_appsheet_intimacao: string | null
          intimacao_edital_url: string | null
          intimacao_status: string | null
          link_anuncio_jornal_url: string | null
          link_ata_url: string | null
          lote: string | null
          matricula_consolidada_url: string | null
          nota_entrega: string | null
          pagamento_condominio_pos: string | null
          pagamento_iptu_pos: string | null
          saldo_condominio: number | null
          saldo_devedor: number | null
          saldo_iptu: number | null
          termo_quitacao_url: string | null
          valor_arrematacao: number | null
          valor_avaliacao_prefeitura: number | null
          valor_terreno_corrigido: number | null
          valor_terreno_original: number | null
        }
        Insert: {
          aprovacao_direcao?: string | null
          arrematado_leilao1?: string | null
          arrematado_leilao2?: string | null
          averbacao_ata_url?: string | null
          boletos_cancelados?: string | null
          certidao_nao_purgacao_mora_2_url?: string | null
          certidao_nao_purgacao_mora_url?: string | null
          ciente_direcao?: string | null
          cliente?: string | null
          comprovante_devolucao_url?: string | null
          consta_iptu_condominio_edital?: string | null
          contas_a_receber_url?: string | null
          contas_recebidas_url?: string | null
          contrato_url?: string | null
          criado_por_id?: number | null
          custo_consolidacao_ri?: number | null
          custo_intimacao_edital?: number | null
          custo_intimacao_ri?: number | null
          custo_itbi?: number | null
          custo_notificacao_leilao_correio?: number | null
          custo_publicacao_edital_intimacao?: number | null
          custo_publicacao_edital_leilao?: number | null
          data_consolidacao?: string | null
          data_inicio_anuncio?: string | null
          data_leilao1?: string | null
          data_leilao2?: string | null
          data_limite_leilao1?: string | null
          empreendimento?: string | null
          guia_consolidacao_url?: string | null
          id?: number
          id_appsheet_consolidacao?: string | null
          id_appsheet_intimacao?: string | null
          intimacao_edital_url?: string | null
          intimacao_status?: string | null
          link_anuncio_jornal_url?: string | null
          link_ata_url?: string | null
          lote?: string | null
          matricula_consolidada_url?: string | null
          nota_entrega?: string | null
          pagamento_condominio_pos?: string | null
          pagamento_iptu_pos?: string | null
          saldo_condominio?: number | null
          saldo_devedor?: number | null
          saldo_iptu?: number | null
          termo_quitacao_url?: string | null
          valor_arrematacao?: number | null
          valor_avaliacao_prefeitura?: number | null
          valor_terreno_corrigido?: number | null
          valor_terreno_original?: number | null
        }
        Update: {
          aprovacao_direcao?: string | null
          arrematado_leilao1?: string | null
          arrematado_leilao2?: string | null
          averbacao_ata_url?: string | null
          boletos_cancelados?: string | null
          certidao_nao_purgacao_mora_2_url?: string | null
          certidao_nao_purgacao_mora_url?: string | null
          ciente_direcao?: string | null
          cliente?: string | null
          comprovante_devolucao_url?: string | null
          consta_iptu_condominio_edital?: string | null
          contas_a_receber_url?: string | null
          contas_recebidas_url?: string | null
          contrato_url?: string | null
          criado_por_id?: number | null
          custo_consolidacao_ri?: number | null
          custo_intimacao_edital?: number | null
          custo_intimacao_ri?: number | null
          custo_itbi?: number | null
          custo_notificacao_leilao_correio?: number | null
          custo_publicacao_edital_intimacao?: number | null
          custo_publicacao_edital_leilao?: number | null
          data_consolidacao?: string | null
          data_inicio_anuncio?: string | null
          data_leilao1?: string | null
          data_leilao2?: string | null
          data_limite_leilao1?: string | null
          empreendimento?: string | null
          guia_consolidacao_url?: string | null
          id?: number
          id_appsheet_consolidacao?: string | null
          id_appsheet_intimacao?: string | null
          intimacao_edital_url?: string | null
          intimacao_status?: string | null
          link_anuncio_jornal_url?: string | null
          link_ata_url?: string | null
          lote?: string | null
          matricula_consolidada_url?: string | null
          nota_entrega?: string | null
          pagamento_condominio_pos?: string | null
          pagamento_iptu_pos?: string | null
          saldo_condominio?: number | null
          saldo_devedor?: number | null
          saldo_iptu?: number | null
          termo_quitacao_url?: string | null
          valor_arrematacao?: number | null
          valor_avaliacao_prefeitura?: number | null
          valor_terreno_corrigido?: number | null
          valor_terreno_original?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_leilao_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_notificacao_processo: {
        Row: {
          aprovacao_direcao_etapa1: string | null
          aprovacao_direcao_etapa2: string | null
          aprovacao_etapa1: string | null
          aprovacao_etapa2: string | null
          ar_assinado_url: string | null
          boletos_baixados: string | null
          cancelado_sienge: string | null
          cliente: string | null
          contrato_url: string | null
          criado_por_id: number | null
          empreendimento: string | null
          envio_correio_info: string | null
          envio_email_url: string | null
          envio_whatsapp_url: string | null
          gatilho_valor: number | null
          id: number
          notificacao_1_url: string | null
          notificacao_2_url: string | null
          numero_lote: string | null
          observacoes: string | null
          pagamento_iptu: string | null
          prazo_retorno: string | null
          relatorio_a_receber_url: string | null
          relatorio_recebidas_url: string | null
          retorno_no_prazo: string | null
          status: string | null
          status_manual: boolean | null
        }
        Insert: {
          aprovacao_direcao_etapa1?: string | null
          aprovacao_direcao_etapa2?: string | null
          aprovacao_etapa1?: string | null
          aprovacao_etapa2?: string | null
          ar_assinado_url?: string | null
          boletos_baixados?: string | null
          cancelado_sienge?: string | null
          cliente?: string | null
          contrato_url?: string | null
          criado_por_id?: number | null
          empreendimento?: string | null
          envio_correio_info?: string | null
          envio_email_url?: string | null
          envio_whatsapp_url?: string | null
          gatilho_valor?: number | null
          id?: number
          notificacao_1_url?: string | null
          notificacao_2_url?: string | null
          numero_lote?: string | null
          observacoes?: string | null
          pagamento_iptu?: string | null
          prazo_retorno?: string | null
          relatorio_a_receber_url?: string | null
          relatorio_recebidas_url?: string | null
          retorno_no_prazo?: string | null
          status?: string | null
          status_manual?: boolean | null
        }
        Update: {
          aprovacao_direcao_etapa1?: string | null
          aprovacao_direcao_etapa2?: string | null
          aprovacao_etapa1?: string | null
          aprovacao_etapa2?: string | null
          ar_assinado_url?: string | null
          boletos_baixados?: string | null
          cancelado_sienge?: string | null
          cliente?: string | null
          contrato_url?: string | null
          criado_por_id?: number | null
          empreendimento?: string | null
          envio_correio_info?: string | null
          envio_email_url?: string | null
          envio_whatsapp_url?: string | null
          gatilho_valor?: number | null
          id?: number
          notificacao_1_url?: string | null
          notificacao_2_url?: string | null
          numero_lote?: string | null
          observacoes?: string | null
          pagamento_iptu?: string | null
          prazo_retorno?: string | null
          relatorio_a_receber_url?: string | null
          relatorio_recebidas_url?: string | null
          retorno_no_prazo?: string | null
          status?: string | null
          status_manual?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_notificacao_processo_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_renegociacao: {
        Row: {
          aditivo_assinado_url: string | null
          aditivo_averbado_url: string | null
          aprovacao_calculo: string | null
          aprovacao_cliente: string | null
          aprovacao_interna: string | null
          concluido_manual: boolean | null
          criado_por_id: number | null
          data_aprovacao_rejeicao: string | null
          data_atualizacao_gatilho: string | null
          data_envio_cliente: string | null
          data_primeira_parcela: string | null
          data_solicitacao: string | null
          data_solicitacao_averbacao: string | null
          empreendimento: string | null
          gatilho_atingido: string | null
          id: number
          id_appsheet: string | null
          id_helpdesk: string | null
          link_aditivo_url: string | null
          link_calculo_url: string | null
          motivo: string | null
          nome_cliente: string | null
          numero_lote: string | null
          pago: boolean | null
          registrado: string | null
          relatorio_contas_a_receber_url: string | null
          relatorio_contas_recebidas_url: string | null
          revisao: string | null
          status: string | null
          tipo_operacao: string | null
        }
        Insert: {
          aditivo_assinado_url?: string | null
          aditivo_averbado_url?: string | null
          aprovacao_calculo?: string | null
          aprovacao_cliente?: string | null
          aprovacao_interna?: string | null
          concluido_manual?: boolean | null
          criado_por_id?: number | null
          data_aprovacao_rejeicao?: string | null
          data_atualizacao_gatilho?: string | null
          data_envio_cliente?: string | null
          data_primeira_parcela?: string | null
          data_solicitacao?: string | null
          data_solicitacao_averbacao?: string | null
          empreendimento?: string | null
          gatilho_atingido?: string | null
          id?: number
          id_appsheet?: string | null
          id_helpdesk?: string | null
          link_aditivo_url?: string | null
          link_calculo_url?: string | null
          motivo?: string | null
          nome_cliente?: string | null
          numero_lote?: string | null
          pago?: boolean | null
          registrado?: string | null
          relatorio_contas_a_receber_url?: string | null
          relatorio_contas_recebidas_url?: string | null
          revisao?: string | null
          status?: string | null
          tipo_operacao?: string | null
        }
        Update: {
          aditivo_assinado_url?: string | null
          aditivo_averbado_url?: string | null
          aprovacao_calculo?: string | null
          aprovacao_cliente?: string | null
          aprovacao_interna?: string | null
          concluido_manual?: boolean | null
          criado_por_id?: number | null
          data_aprovacao_rejeicao?: string | null
          data_atualizacao_gatilho?: string | null
          data_envio_cliente?: string | null
          data_primeira_parcela?: string | null
          data_solicitacao?: string | null
          data_solicitacao_averbacao?: string | null
          empreendimento?: string | null
          gatilho_atingido?: string | null
          id?: number
          id_appsheet?: string | null
          id_helpdesk?: string | null
          link_aditivo_url?: string | null
          link_calculo_url?: string | null
          motivo?: string | null
          nome_cliente?: string | null
          numero_lote?: string | null
          pago?: boolean | null
          registrado?: string | null
          relatorio_contas_a_receber_url?: string | null
          relatorio_contas_recebidas_url?: string | null
          revisao?: string | null
          status?: string | null
          tipo_operacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_renegociacao_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_titularidade_nao_registrado: {
        Row: {
          aprovacao_minutas: string | null
          criado_por_id: number | null
          data_solicitacao: string | null
          desistencia: boolean | null
          empreendimento: string | null
          id: number
          id_helpdesk: string | null
          informou_financeiro: boolean | null
          link_contrato_original: string | null
          link_distrato_assinado: string | null
          link_novo_contrato_assinado: string | null
          link_pagamento_taxa: string | null
          link_valor_a_cobrar: string | null
          link_valores_a_pagar: string | null
          link_valores_ja_pagos: string | null
          minuta_distrato: string | null
          minuta_novo_contrato: string | null
          motivo_troca: string | null
          nome_cliente_atual: string | null
          novo_titular: string | null
          numero_lote: string | null
          status: string | null
        }
        Insert: {
          aprovacao_minutas?: string | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          informou_financeiro?: boolean | null
          link_contrato_original?: string | null
          link_distrato_assinado?: string | null
          link_novo_contrato_assinado?: string | null
          link_pagamento_taxa?: string | null
          link_valor_a_cobrar?: string | null
          link_valores_a_pagar?: string | null
          link_valores_ja_pagos?: string | null
          minuta_distrato?: string | null
          minuta_novo_contrato?: string | null
          motivo_troca?: string | null
          nome_cliente_atual?: string | null
          novo_titular?: string | null
          numero_lote?: string | null
          status?: string | null
        }
        Update: {
          aprovacao_minutas?: string | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          informou_financeiro?: boolean | null
          link_contrato_original?: string | null
          link_distrato_assinado?: string | null
          link_novo_contrato_assinado?: string | null
          link_pagamento_taxa?: string | null
          link_valor_a_cobrar?: string | null
          link_valores_a_pagar?: string | null
          link_valores_ja_pagos?: string | null
          minuta_distrato?: string | null
          minuta_novo_contrato?: string | null
          motivo_troca?: string | null
          nome_cliente_atual?: string | null
          novo_titular?: string | null
          numero_lote?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_titularidade_nao_registrado_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_titularidade_nao_registrado_quitado: {
        Row: {
          aprovacao_minutas: string | null
          atualiza_estoque_legal: boolean | null
          criado_por_id: number | null
          data_solicitacao: string | null
          desistencia: boolean | null
          empreendimento: string | null
          id: number
          id_helpdesk: string | null
          informou_financeiro: boolean | null
          link_contrato_original: string | null
          link_escritura_assinada: string | null
          link_matricula_averbada: string | null
          link_pagamento_taxa: string | null
          link_valor_a_cobrar: string | null
          link_valores_a_pagar: string | null
          link_valores_ja_pagos: string | null
          lote_quitado: boolean | null
          minuta_escritura: string | null
          motivo_troca: string | null
          nome_cliente_atual: string | null
          novo_titular: string | null
          numero_lote: string | null
          status: string | null
        }
        Insert: {
          aprovacao_minutas?: string | null
          atualiza_estoque_legal?: boolean | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          informou_financeiro?: boolean | null
          link_contrato_original?: string | null
          link_escritura_assinada?: string | null
          link_matricula_averbada?: string | null
          link_pagamento_taxa?: string | null
          link_valor_a_cobrar?: string | null
          link_valores_a_pagar?: string | null
          link_valores_ja_pagos?: string | null
          lote_quitado?: boolean | null
          minuta_escritura?: string | null
          motivo_troca?: string | null
          nome_cliente_atual?: string | null
          novo_titular?: string | null
          numero_lote?: string | null
          status?: string | null
        }
        Update: {
          aprovacao_minutas?: string | null
          atualiza_estoque_legal?: boolean | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          informou_financeiro?: boolean | null
          link_contrato_original?: string | null
          link_escritura_assinada?: string | null
          link_matricula_averbada?: string | null
          link_pagamento_taxa?: string | null
          link_valor_a_cobrar?: string | null
          link_valores_a_pagar?: string | null
          link_valores_ja_pagos?: string | null
          lote_quitado?: boolean | null
          minuta_escritura?: string | null
          motivo_troca?: string | null
          nome_cliente_atual?: string | null
          novo_titular?: string | null
          numero_lote?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_titularidade_nao_registrado_quitado_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_titularidade_registrado: {
        Row: {
          aprovacao_minutas: string | null
          atualiza_estoque_legal: boolean | null
          criado_por_id: number | null
          data_solicitacao: string | null
          desistencia: boolean | null
          empreendimento: string | null
          id: number
          id_helpdesk: string | null
          informou_financeiro: boolean | null
          link_contrato_original: string | null
          link_escritura_assinada: string | null
          link_matricula_averbada: string | null
          link_pagamento_taxa: string | null
          link_valor_a_cobrar: string | null
          link_valores_a_pagar: string | null
          link_valores_ja_pagos: string | null
          minuta_escritura: string | null
          motivo_troca: string | null
          nome_cliente_atual: string | null
          novo_titular: string | null
          numero_lote: string | null
          status: string | null
        }
        Insert: {
          aprovacao_minutas?: string | null
          atualiza_estoque_legal?: boolean | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          informou_financeiro?: boolean | null
          link_contrato_original?: string | null
          link_escritura_assinada?: string | null
          link_matricula_averbada?: string | null
          link_pagamento_taxa?: string | null
          link_valor_a_cobrar?: string | null
          link_valores_a_pagar?: string | null
          link_valores_ja_pagos?: string | null
          minuta_escritura?: string | null
          motivo_troca?: string | null
          nome_cliente_atual?: string | null
          novo_titular?: string | null
          numero_lote?: string | null
          status?: string | null
        }
        Update: {
          aprovacao_minutas?: string | null
          atualiza_estoque_legal?: boolean | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          informou_financeiro?: boolean | null
          link_contrato_original?: string | null
          link_escritura_assinada?: string | null
          link_matricula_averbada?: string | null
          link_pagamento_taxa?: string | null
          link_valor_a_cobrar?: string | null
          link_valores_a_pagar?: string | null
          link_valores_ja_pagos?: string | null
          minuta_escritura?: string | null
          motivo_troca?: string | null
          nome_cliente_atual?: string | null
          novo_titular?: string | null
          numero_lote?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_titularidade_registrado_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_troca_lote_nao_registrado: {
        Row: {
          aprovacao_minuta_novo_contrato_por: string | null
          atualiza_estoque_legal: boolean | null
          avisar_comercial: boolean | null
          coletar_assinaturas: boolean | null
          criado_por_id: number | null
          data_solicitacao: string | null
          desistencia: boolean | null
          empreendimento: string | null
          id: number
          id_helpdesk: string | null
          informou_financeiro: boolean | null
          link_contrato_original: string | null
          link_distrato_assinado: string | null
          link_minuta_novo_contrato: string | null
          link_novo_contrato_assinado: string | null
          link_print_calculadora: string | null
          motivo_troca: string | null
          nome_cliente: string | null
          numero_lote_novo: string | null
          numero_lote_original: string | null
          status: string | null
          valor_avista_novo_lote: number | null
          valor_credito_utilizar: number | null
          valor_novo_lote_corrigido: number | null
          valores_a_descontar: number | null
          valores_ja_pagos_contrato_original: number | null
        }
        Insert: {
          aprovacao_minuta_novo_contrato_por?: string | null
          atualiza_estoque_legal?: boolean | null
          avisar_comercial?: boolean | null
          coletar_assinaturas?: boolean | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          informou_financeiro?: boolean | null
          link_contrato_original?: string | null
          link_distrato_assinado?: string | null
          link_minuta_novo_contrato?: string | null
          link_novo_contrato_assinado?: string | null
          link_print_calculadora?: string | null
          motivo_troca?: string | null
          nome_cliente?: string | null
          numero_lote_novo?: string | null
          numero_lote_original?: string | null
          status?: string | null
          valor_avista_novo_lote?: number | null
          valor_credito_utilizar?: number | null
          valor_novo_lote_corrigido?: number | null
          valores_a_descontar?: number | null
          valores_ja_pagos_contrato_original?: number | null
        }
        Update: {
          aprovacao_minuta_novo_contrato_por?: string | null
          atualiza_estoque_legal?: boolean | null
          avisar_comercial?: boolean | null
          coletar_assinaturas?: boolean | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          informou_financeiro?: boolean | null
          link_contrato_original?: string | null
          link_distrato_assinado?: string | null
          link_minuta_novo_contrato?: string | null
          link_novo_contrato_assinado?: string | null
          link_print_calculadora?: string | null
          motivo_troca?: string | null
          nome_cliente?: string | null
          numero_lote_novo?: string | null
          numero_lote_original?: string | null
          status?: string | null
          valor_avista_novo_lote?: number | null
          valor_credito_utilizar?: number | null
          valor_novo_lote_corrigido?: number | null
          valores_a_descontar?: number | null
          valores_ja_pagos_contrato_original?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_troca_lote_nao_registrado_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_troca_lote_registrado: {
        Row: {
          alteracao_reserva_tecnica: boolean | null
          aprovacao_minuta_escritura_distrato_por: string | null
          aprovacao_minuta_novo_contrato_por: string | null
          atualiza_estoque_legal: boolean | null
          avisar_comercial: boolean | null
          confirmar_novo_lote_condicoes: boolean | null
          criado_por_id: number | null
          data_solicitacao: string | null
          desistencia: boolean | null
          empreendimento: string | null
          id: number
          id_helpdesk: string | null
          informou_financeiro: boolean | null
          link_contrato_original: string | null
          link_distrato_troca_assinado: string | null
          link_escritura_assinada: string | null
          link_matricula_averbada: string | null
          link_novo_contrato_assinado_troca: string | null
          link_print_calculadora: string | null
          minuta_escritura_distrato: string | null
          minuta_novo_contrato_troca: string | null
          motivo_troca: string | null
          nome_cliente: string | null
          numero_lote_novo: string | null
          numero_lote_original: string | null
          status: string | null
          valor_avista_novo_lote: number | null
          valor_credito_utilizar: number | null
          valor_novo_lote_corrigido: number | null
          valores_a_descontar: number | null
          valores_ja_pagos_contrato_original: number | null
        }
        Insert: {
          alteracao_reserva_tecnica?: boolean | null
          aprovacao_minuta_escritura_distrato_por?: string | null
          aprovacao_minuta_novo_contrato_por?: string | null
          atualiza_estoque_legal?: boolean | null
          avisar_comercial?: boolean | null
          confirmar_novo_lote_condicoes?: boolean | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          informou_financeiro?: boolean | null
          link_contrato_original?: string | null
          link_distrato_troca_assinado?: string | null
          link_escritura_assinada?: string | null
          link_matricula_averbada?: string | null
          link_novo_contrato_assinado_troca?: string | null
          link_print_calculadora?: string | null
          minuta_escritura_distrato?: string | null
          minuta_novo_contrato_troca?: string | null
          motivo_troca?: string | null
          nome_cliente?: string | null
          numero_lote_novo?: string | null
          numero_lote_original?: string | null
          status?: string | null
          valor_avista_novo_lote?: number | null
          valor_credito_utilizar?: number | null
          valor_novo_lote_corrigido?: number | null
          valores_a_descontar?: number | null
          valores_ja_pagos_contrato_original?: number | null
        }
        Update: {
          alteracao_reserva_tecnica?: boolean | null
          aprovacao_minuta_escritura_distrato_por?: string | null
          aprovacao_minuta_novo_contrato_por?: string | null
          atualiza_estoque_legal?: boolean | null
          avisar_comercial?: boolean | null
          confirmar_novo_lote_condicoes?: boolean | null
          criado_por_id?: number | null
          data_solicitacao?: string | null
          desistencia?: boolean | null
          empreendimento?: string | null
          id?: number
          id_helpdesk?: string | null
          informou_financeiro?: boolean | null
          link_contrato_original?: string | null
          link_distrato_troca_assinado?: string | null
          link_escritura_assinada?: string | null
          link_matricula_averbada?: string | null
          link_novo_contrato_assinado_troca?: string | null
          link_print_calculadora?: string | null
          minuta_escritura_distrato?: string | null
          minuta_novo_contrato_troca?: string | null
          motivo_troca?: string | null
          nome_cliente?: string | null
          numero_lote_novo?: string | null
          numero_lote_original?: string | null
          status?: string | null
          valor_avista_novo_lote?: number | null
          valor_credito_utilizar?: number | null
          valor_novo_lote_corrigido?: number | null
          valores_a_descontar?: number | null
          valores_ja_pagos_contrato_original?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posvenda_troca_lote_registrado_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "posvenda_user"
            referencedColumns: ["id"]
          },
        ]
      }
      posvenda_user: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string | null
          id: number
          is_admin: boolean | null
          nome: string | null
          password_hash: string
          perfil: string | null
          ultimo_login: string | null
          username: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: number
          is_admin?: boolean | null
          nome?: string | null
          password_hash: string
          perfil?: string | null
          ultimo_login?: string | null
          username: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: number
          is_admin?: boolean | null
          nome?: string | null
          password_hash?: string
          perfil?: string | null
          ultimo_login?: string | null
          username?: string
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
      registros_comprovantes: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          lote_id: string
          registro_id: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          lote_id: string
          registro_id: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          lote_id?: string
          registro_id?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_comprovantes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "registros_lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_comprovantes_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "registros_registros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_comprovantes_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "registros_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      registros_contratos: {
        Row: {
          ativo: boolean
          cliente_email: string | null
          cliente_nome: string
          created_at: string
          data_contrato: string | null
          dias_em_atraso: number | null
          id: string
          lote_id: string
          numero_contrato: string | null
          sienge_contract_id: number
          ultima_atualizacao_valor: string | null
          valor_ja_pago: number | null
          valor_total: number | null
        }
        Insert: {
          ativo?: boolean
          cliente_email?: string | null
          cliente_nome?: string
          created_at?: string
          data_contrato?: string | null
          dias_em_atraso?: number | null
          id?: string
          lote_id: string
          numero_contrato?: string | null
          sienge_contract_id: number
          ultima_atualizacao_valor?: string | null
          valor_ja_pago?: number | null
          valor_total?: number | null
        }
        Update: {
          ativo?: boolean
          cliente_email?: string | null
          cliente_nome?: string
          created_at?: string
          data_contrato?: string | null
          dias_em_atraso?: number | null
          id?: string
          lote_id?: string
          numero_contrato?: string | null
          sienge_contract_id?: number
          ultima_atualizacao_valor?: string | null
          valor_ja_pago?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registros_contratos_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "registros_lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      registros_empreendimentos: {
        Row: {
          created_at: string
          id: string
          nome: string
          sienge_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          sienge_id: number
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          sienge_id?: number
        }
        Relationships: []
      }
      registros_lotes: {
        Row: {
          created_at: string
          empreendimento_id: string
          id: string
          numero: string
          sienge_unit_id: number
          valor_avista: number | null
        }
        Insert: {
          created_at?: string
          empreendimento_id: string
          id?: string
          numero: string
          sienge_unit_id: number
          valor_avista?: number | null
        }
        Update: {
          created_at?: string
          empreendimento_id?: string
          id?: string
          numero?: string
          sienge_unit_id?: number
          valor_avista?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registros_lotes_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "registros_empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      registros_registros: {
        Row: {
          andamento: string | null
          boleto_itbi_url: string | null
          comprovante_itbi_url: string | null
          contrato_id: string | null
          created_at: string
          data_entrega_ri: string | null
          data_gatilho: string | null
          data_recebimento_ri: string | null
          data_recolhimento_itbi: string | null
          data_solicitacao_itbi: string | null
          etapa_analise: string | null
          financiamento_caixa: boolean
          id: string
          impugnado: boolean
          lote_id: string
          matricula_url: string | null
          nf_registro_url: string | null
          observacoes: string | null
          op_registro_url: string | null
          responsabilidade_cliente: boolean
          segurar_registro: boolean
          updated_at: string
          valor_itbi: number | null
        }
        Insert: {
          andamento?: string | null
          boleto_itbi_url?: string | null
          comprovante_itbi_url?: string | null
          contrato_id?: string | null
          created_at?: string
          data_entrega_ri?: string | null
          data_gatilho?: string | null
          data_recebimento_ri?: string | null
          data_recolhimento_itbi?: string | null
          data_solicitacao_itbi?: string | null
          etapa_analise?: string | null
          financiamento_caixa?: boolean
          id?: string
          impugnado?: boolean
          lote_id: string
          matricula_url?: string | null
          nf_registro_url?: string | null
          observacoes?: string | null
          op_registro_url?: string | null
          responsabilidade_cliente?: boolean
          segurar_registro?: boolean
          updated_at?: string
          valor_itbi?: number | null
        }
        Update: {
          andamento?: string | null
          boleto_itbi_url?: string | null
          comprovante_itbi_url?: string | null
          contrato_id?: string | null
          created_at?: string
          data_entrega_ri?: string | null
          data_gatilho?: string | null
          data_recebimento_ri?: string | null
          data_recolhimento_itbi?: string | null
          data_solicitacao_itbi?: string | null
          etapa_analise?: string | null
          financiamento_caixa?: boolean
          id?: string
          impugnado?: boolean
          lote_id?: string
          matricula_url?: string | null
          nf_registro_url?: string | null
          observacoes?: string | null
          op_registro_url?: string | null
          responsabilidade_cliente?: boolean
          segurar_registro?: boolean
          updated_at?: string
          valor_itbi?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "registros_registros_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "registros_contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_registros_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: true
            referencedRelation: "registros_lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      registros_sync_logs: {
        Row: {
          detalhes: Json | null
          finished_at: string | null
          id: string
          registros_atualizados: number | null
          started_at: string
          status: string
        }
        Insert: {
          detalhes?: Json | null
          finished_at?: string | null
          id?: string
          registros_atualizados?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          detalhes?: Json | null
          finished_at?: string | null
          id?: string
          registros_atualizados?: number | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      registros_usuarios: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["registros_user_role"]
          senha_hash: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome: string
          role?: Database["public"]["Enums"]["registros_user_role"]
          senha_hash: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["registros_user_role"]
          senha_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_configs: {
        Row: {
          ativo: boolean
          created_at: string
          cron_ativo: boolean | null
          cron_expression: string | null
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
          cron_ativo?: boolean | null
          cron_expression?: string | null
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
          cron_ativo?: boolean | null
          cron_expression?: string | null
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
      rh_absenteismo: {
        Row: {
          created_at: string
          dias_faltas: number
          dias_trabalhados: number
          funcionario_id: string
          id: string
          mes_referencia: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dias_faltas?: number
          dias_trabalhados?: number
          funcionario_id: string
          id?: string
          mes_referencia: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dias_faltas?: number
          dias_trabalhados?: number
          funcionario_id?: string
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_absenteismo_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_adiantamentos: {
        Row: {
          created_at: string
          data: string
          datas_pagamento_pretendidas: string[] | null
          funcionario_id: string
          id: string
          observacoes: string | null
          parcelas: Json | null
          valor: number
        }
        Insert: {
          created_at?: string
          data?: string
          datas_pagamento_pretendidas?: string[] | null
          funcionario_id: string
          id?: string
          observacoes?: string | null
          parcelas?: Json | null
          valor?: number
        }
        Update: {
          created_at?: string
          data?: string
          datas_pagamento_pretendidas?: string[] | null
          funcionario_id?: string
          id?: string
          observacoes?: string | null
          parcelas?: Json | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "rh_adiantamentos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_aditivo_tipo_aditivo: {
        Row: {
          aditivo_id: string
          created_at: string
          id: string
          tipo_aditivo_id: string
        }
        Insert: {
          aditivo_id: string
          created_at?: string
          id?: string
          tipo_aditivo_id: string
        }
        Update: {
          aditivo_id?: string
          created_at?: string
          id?: string
          tipo_aditivo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_aditivo_tipo_aditivo_aditivo_id_fkey"
            columns: ["aditivo_id"]
            isOneToOne: false
            referencedRelation: "rh_aditivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_aditivo_tipo_aditivo_tipo_aditivo_id_fkey"
            columns: ["tipo_aditivo_id"]
            isOneToOne: false
            referencedRelation: "rh_tipos_aditivo"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_aditivos: {
        Row: {
          anexo_name: string | null
          anexo_path: string | null
          cargo_final_id: string | null
          created_at: string
          data: string
          empresa_final_id: string | null
          equipe_final_id: string | null
          funcionario_id: string
          id: string
          observacoes: string | null
        }
        Insert: {
          anexo_name?: string | null
          anexo_path?: string | null
          cargo_final_id?: string | null
          created_at?: string
          data?: string
          empresa_final_id?: string | null
          equipe_final_id?: string | null
          funcionario_id: string
          id?: string
          observacoes?: string | null
        }
        Update: {
          anexo_name?: string | null
          anexo_path?: string | null
          cargo_final_id?: string | null
          created_at?: string
          data?: string
          empresa_final_id?: string | null
          equipe_final_id?: string | null
          funcionario_id?: string
          id?: string
          observacoes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_aditivos_cargo_final_id_fkey"
            columns: ["cargo_final_id"]
            isOneToOne: false
            referencedRelation: "rh_cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_aditivos_empresa_final_id_fkey"
            columns: ["empresa_final_id"]
            isOneToOne: false
            referencedRelation: "rh_empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_aditivos_equipe_final_id_fkey"
            columns: ["equipe_final_id"]
            isOneToOne: false
            referencedRelation: "rh_equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_aditivos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_admissoes_desligamentos: {
        Row: {
          anexo_name: string | null
          anexo_path: string | null
          created_at: string
          data: string
          funcionario_id: string
          id: string
          observacoes: string | null
          tipo: string
        }
        Insert: {
          anexo_name?: string | null
          anexo_path?: string | null
          created_at?: string
          data?: string
          funcionario_id: string
          id?: string
          observacoes?: string | null
          tipo: string
        }
        Update: {
          anexo_name?: string | null
          anexo_path?: string | null
          created_at?: string
          data?: string
          funcionario_id?: string
          id?: string
          observacoes?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_admissoes_desligamentos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_advertencias: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data: string
          funcionario_id: string
          id: string
          motivo: string
          tipo: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data: string
          funcionario_id: string
          id?: string
          motivo: string
          tipo: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data?: string
          funcionario_id?: string
          id?: string
          motivo?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_advertencias_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_atividades: {
        Row: {
          created_at: string
          descricao: string
          grupo_id: string
          id: string
          manual_link: string | null
          metodos_auditoria: string | null
          responsavel_id: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          grupo_id: string
          id?: string
          manual_link?: string | null
          metodos_auditoria?: string | null
          responsavel_id?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          grupo_id?: string
          id?: string
          manual_link?: string | null
          metodos_auditoria?: string | null
          responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_atividades_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "rh_grupos_atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_atividades_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_avaliacoes: {
        Row: {
          anexo_name: string | null
          anexo_path: string | null
          avaliador_id: string | null
          created_at: string
          data_avaliacao: string
          funcionario_id: string
          id: string
          observacoes: string | null
          pontuacao_auditorias: number
          pontuacao_metas: number
          pontuacao_resultados: number
          pontuacao_valores: number
        }
        Insert: {
          anexo_name?: string | null
          anexo_path?: string | null
          avaliador_id?: string | null
          created_at?: string
          data_avaliacao?: string
          funcionario_id: string
          id?: string
          observacoes?: string | null
          pontuacao_auditorias?: number
          pontuacao_metas?: number
          pontuacao_resultados?: number
          pontuacao_valores?: number
        }
        Update: {
          anexo_name?: string | null
          anexo_path?: string | null
          avaliador_id?: string | null
          created_at?: string
          data_avaliacao?: string
          funcionario_id?: string
          id?: string
          observacoes?: string | null
          pontuacao_auditorias?: number
          pontuacao_metas?: number
          pontuacao_resultados?: number
          pontuacao_valores?: number
        }
        Relationships: [
          {
            foreignKeyName: "rh_avaliacoes_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_avaliacoes_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_cargos: {
        Row: {
          adicionais: string | null
          created_at: string
          id: string
          nivel: number
          nome: string
          remuneracao: number
          trilha_id: string
        }
        Insert: {
          adicionais?: string | null
          created_at?: string
          id?: string
          nivel?: number
          nome: string
          remuneracao?: number
          trilha_id: string
        }
        Update: {
          adicionais?: string | null
          created_at?: string
          id?: string
          nivel?: number
          nome?: string
          remuneracao?: number
          trilha_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_cargos_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "rh_trilhas_cargo"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_empresas: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      rh_equipes: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      rh_folha_descontos: {
        Row: {
          created_at: string
          folha_id: string
          id: string
          observacao: string | null
          origem: string
          tipo: string
          valor: number
        }
        Insert: {
          created_at?: string
          folha_id: string
          id?: string
          observacao?: string | null
          origem?: string
          tipo: string
          valor?: number
        }
        Update: {
          created_at?: string
          folha_id?: string
          id?: string
          observacao?: string | null
          origem?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "rh_folha_descontos_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "rh_folha_mensal"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_folha_mensal: {
        Row: {
          anexo_holerite_path: string | null
          auxilio_educacional: boolean
          created_at: string
          desconto_titulo_parque: number
          descontos_adiantamentos: number
          funcionario_id: string
          horas_atraso_faltas: number
          horas_extra: number
          id: string
          mes_referencia: string
          observacoes: string | null
          plano_saude: number
          valor_comissoes: number
          valor_plr: number
          valor_vr: number
          vr_desconsiderado: boolean
          vr_justificativa: string | null
        }
        Insert: {
          anexo_holerite_path?: string | null
          auxilio_educacional?: boolean
          created_at?: string
          desconto_titulo_parque?: number
          descontos_adiantamentos?: number
          funcionario_id: string
          horas_atraso_faltas?: number
          horas_extra?: number
          id?: string
          mes_referencia: string
          observacoes?: string | null
          plano_saude?: number
          valor_comissoes?: number
          valor_plr?: number
          valor_vr?: number
          vr_desconsiderado?: boolean
          vr_justificativa?: string | null
        }
        Update: {
          anexo_holerite_path?: string | null
          auxilio_educacional?: boolean
          created_at?: string
          desconto_titulo_parque?: number
          descontos_adiantamentos?: number
          funcionario_id?: string
          horas_atraso_faltas?: number
          horas_extra?: number
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          plano_saude?: number
          valor_comissoes?: number
          valor_plr?: number
          valor_vr?: number
          vr_desconsiderado?: boolean
          vr_justificativa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_folha_mensal_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_folha_reembolsos: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          created_at: string
          criado_por: string | null
          folha_id: string
          id: string
          observacao: string | null
          origem: string
          status: string
          tipo: string
          valor: number
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          criado_por?: string | null
          folha_id: string
          id?: string
          observacao?: string | null
          origem?: string
          status?: string
          tipo: string
          valor?: number
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          created_at?: string
          criado_por?: string | null
          folha_id?: string
          id?: string
          observacao?: string | null
          origem?: string
          status?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "rh_folha_reembolsos_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "rh_folha_mensal"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_funcionario_anexos: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          funcionario_id: string
          id: string
          tipo: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          funcionario_id: string
          id?: string
          tipo: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          funcionario_id?: string
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_funcionario_anexos_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_funcionario_beneficios_moradia: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string
          funcionario_id: string
          id: string
          observacao: string | null
          percentual_auxilio_moradia: number
          updated_at: string
          valor_reembolso_aluguel: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio: string
          funcionario_id: string
          id?: string
          observacao?: string | null
          percentual_auxilio_moradia?: number
          updated_at?: string
          valor_reembolso_aluguel?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string
          funcionario_id?: string
          id?: string
          observacao?: string | null
          percentual_auxilio_moradia?: number
          updated_at?: string
          valor_reembolso_aluguel?: number
        }
        Relationships: [
          {
            foreignKeyName: "rh_funcionario_beneficios_moradia_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_funcionarios: {
        Row: {
          aniversario: string | null
          cargo_id: string | null
          cpf: string | null
          created_at: string
          data_contrato_vigente: string | null
          empresa_id: string | null
          endereco: string | null
          equipe_id: string | null
          foto_url: string | null
          gestor_id: string | null
          id: string
          kit_onboarding: boolean
          nome_completo: string
          rg: string | null
          seguro_vida: boolean
          telefone: string | null
          tipo_contrato: string | null
          updated_at: string
        }
        Insert: {
          aniversario?: string | null
          cargo_id?: string | null
          cpf?: string | null
          created_at?: string
          data_contrato_vigente?: string | null
          empresa_id?: string | null
          endereco?: string | null
          equipe_id?: string | null
          foto_url?: string | null
          gestor_id?: string | null
          id?: string
          kit_onboarding?: boolean
          nome_completo: string
          rg?: string | null
          seguro_vida?: boolean
          telefone?: string | null
          tipo_contrato?: string | null
          updated_at?: string
        }
        Update: {
          aniversario?: string | null
          cargo_id?: string | null
          cpf?: string | null
          created_at?: string
          data_contrato_vigente?: string | null
          empresa_id?: string | null
          endereco?: string | null
          equipe_id?: string | null
          foto_url?: string | null
          gestor_id?: string | null
          id?: string
          kit_onboarding?: boolean
          nome_completo?: string
          rg?: string | null
          seguro_vida?: boolean
          telefone?: string | null
          tipo_contrato?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_funcionarios_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "rh_cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_funcionarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "rh_empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_funcionarios_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "rh_equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_funcionarios_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_grupos_atividades: {
        Row: {
          created_at: string
          id: string
          nome: string
          responsavel_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          responsavel_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rh_grupos_atividades_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_plano_saude: {
        Row: {
          created_at: string
          funcionario_id: string
          id: string
          mes_referencia: string
          observacoes: string | null
          updated_at: string
          uso_plano: number
          valor_odonto: number
          valor_saude: number
        }
        Insert: {
          created_at?: string
          funcionario_id: string
          id?: string
          mes_referencia: string
          observacoes?: string | null
          updated_at?: string
          uso_plano?: number
          valor_odonto?: number
          valor_saude?: number
        }
        Update: {
          created_at?: string
          funcionario_id?: string
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          updated_at?: string
          uso_plano?: number
          valor_odonto?: number
          valor_saude?: number
        }
        Relationships: [
          {
            foreignKeyName: "rh_plano_saude_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_tipos_aditivo: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      rh_tipos_treinamento: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      rh_treinamento_participantes: {
        Row: {
          funcionario_id: string
          id: string
          treinamento_id: string
        }
        Insert: {
          funcionario_id: string
          id?: string
          treinamento_id: string
        }
        Update: {
          funcionario_id?: string
          id?: string
          treinamento_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_treinamento_participantes_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "rh_funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rh_treinamento_participantes_treinamento_id_fkey"
            columns: ["treinamento_id"]
            isOneToOne: false
            referencedRelation: "rh_treinamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_treinamentos: {
        Row: {
          created_at: string | null
          data: string
          id: string
          observacoes: string | null
          tipo_treinamento_id: string
        }
        Insert: {
          created_at?: string | null
          data: string
          id?: string
          observacoes?: string | null
          tipo_treinamento_id: string
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          observacoes?: string | null
          tipo_treinamento_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rh_treinamentos_tipo_treinamento_id_fkey"
            columns: ["tipo_treinamento_id"]
            isOneToOne: false
            referencedRelation: "rh_tipos_treinamento"
            referencedColumns: ["id"]
          },
        ]
      }
      rh_trilhas_cargo: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      rh_user_profiles: {
        Row: {
          created_at: string
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      rh_user_roles: {
        Row: {
          id: string
          nome: string | null
          role: Database["public"]["Enums"]["rh_app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["rh_app_role"]
          user_id: string
        }
        Update: {
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["rh_app_role"]
          user_id?: string
        }
        Relationships: []
      }
      sienge_clientes: {
        Row: {
          address_number: string | null
          address_type: string | null
          addresses_all: Json | null
          birth_date: string | null
          birth_place: string | null
          city: string | null
          city_id: number | null
          civil_status: string | null
          client_type: string | null
          contact_email: string | null
          contact_name: string | null
          contacts_all: Json | null
          cpf: string | null
          created_at: string
          email: string | null
          family_income: Json | null
          father_name: string | null
          foreigner: string | null
          id: number
          international_id: string | null
          issue_date_identity_card: string | null
          issuing_body: string | null
          license_issue_date: string | null
          license_issuing_body: string | null
          license_number: string | null
          mail: boolean | null
          mailing_address: string | null
          matrimonial_regime: string | null
          modified_at: string
          mother_name: string | null
          name: string
          nationality: string | null
          neighborhood: string | null
          number_identity_card: string | null
          person_type: string | null
          phone_idd: string | null
          phone_main: boolean | null
          phone_number: string | null
          phone_type: string | null
          phones_all: Json | null
          procurators: Json | null
          profession: string | null
          raw_data: Json | null
          sex: string | null
          spouse: Json | null
          state: string | null
          street_name: string | null
          sub_types: Json | null
          synced_at: string | null
          zip_code: string | null
        }
        Insert: {
          address_number?: string | null
          address_type?: string | null
          addresses_all?: Json | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          city_id?: number | null
          civil_status?: string | null
          client_type?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contacts_all?: Json | null
          cpf?: string | null
          created_at: string
          email?: string | null
          family_income?: Json | null
          father_name?: string | null
          foreigner?: string | null
          id: number
          international_id?: string | null
          issue_date_identity_card?: string | null
          issuing_body?: string | null
          license_issue_date?: string | null
          license_issuing_body?: string | null
          license_number?: string | null
          mail?: boolean | null
          mailing_address?: string | null
          matrimonial_regime?: string | null
          modified_at: string
          mother_name?: string | null
          name: string
          nationality?: string | null
          neighborhood?: string | null
          number_identity_card?: string | null
          person_type?: string | null
          phone_idd?: string | null
          phone_main?: boolean | null
          phone_number?: string | null
          phone_type?: string | null
          phones_all?: Json | null
          procurators?: Json | null
          profession?: string | null
          raw_data?: Json | null
          sex?: string | null
          spouse?: Json | null
          state?: string | null
          street_name?: string | null
          sub_types?: Json | null
          synced_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address_number?: string | null
          address_type?: string | null
          addresses_all?: Json | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          city_id?: number | null
          civil_status?: string | null
          client_type?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contacts_all?: Json | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          family_income?: Json | null
          father_name?: string | null
          foreigner?: string | null
          id?: number
          international_id?: string | null
          issue_date_identity_card?: string | null
          issuing_body?: string | null
          license_issue_date?: string | null
          license_issuing_body?: string | null
          license_number?: string | null
          mail?: boolean | null
          mailing_address?: string | null
          matrimonial_regime?: string | null
          modified_at?: string
          mother_name?: string | null
          name?: string
          nationality?: string | null
          neighborhood?: string | null
          number_identity_card?: string | null
          person_type?: string | null
          phone_idd?: string | null
          phone_main?: boolean | null
          phone_number?: string | null
          phone_type?: string | null
          phones_all?: Json | null
          procurators?: Json | null
          profession?: string | null
          raw_data?: Json | null
          sex?: string | null
          spouse?: Json | null
          state?: string | null
          street_name?: string | null
          sub_types?: Json | null
          synced_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      sienge_contrato_clientes: {
        Row: {
          cliente_id: number
          contrato_id: number
          main: boolean | null
          participation_percentage: number | null
          spouse: boolean
          synced_at: string | null
        }
        Insert: {
          cliente_id: number
          contrato_id: number
          main?: boolean | null
          participation_percentage?: number | null
          spouse?: boolean
          synced_at?: string | null
        }
        Update: {
          cliente_id?: number
          contrato_id?: number
          main?: boolean | null
          participation_percentage?: number | null
          spouse?: boolean
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "sienge_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contrato"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "sienge_contratos_de_vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      sienge_contrato_comissoes: {
        Row: {
          contrato_id: number
          total_commission: number
          total_commission_amount: number
        }
        Insert: {
          contrato_id: number
          total_commission: number
          total_commission_amount: number
        }
        Update: {
          contrato_id?: number
          total_commission?: number
          total_commission_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sienge_contrato_comissoes_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: true
            referencedRelation: "sienge_contratos_de_vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      sienge_contrato_corretores: {
        Row: {
          contrato_id: number
          corretor_id: number
          main: boolean
        }
        Insert: {
          contrato_id: number
          corretor_id: number
          main: boolean
        }
        Update: {
          contrato_id?: number
          corretor_id?: number
          main?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sienge_contrato_corretores_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "sienge_contratos_de_vendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sienge_contrato_corretores_corretor_id_fkey"
            columns: ["corretor_id"]
            isOneToOne: false
            referencedRelation: "sienge_corretores"
            referencedColumns: ["id"]
          },
        ]
      }
      sienge_contrato_pagamentos: {
        Row: {
          amount_paid: number | null
          base_date: string | null
          base_date_interest: string | null
          bearer_id: number | null
          bearer_name: string | null
          condition_type_id: string | null
          condition_type_name: string | null
          contrato_id: number | null
          first_payment: string | null
          id: number
          indexer_id: number | null
          indexer_name: string | null
          installments_number: number | null
          interest_percentage: number | null
          interest_type: string | null
          match_maturities: string | null
          months_grace_period: number | null
          open_installments_number: number | null
          order_number: number | null
          order_number_remade_installments: number | null
          outstanding_balance: number | null
          paid_before_contract_additive: boolean | null
          sequence_id: number | null
          status: string | null
          synced_at: string | null
          total_value: number | null
          total_value_interest: number | null
        }
        Insert: {
          amount_paid?: number | null
          base_date?: string | null
          base_date_interest?: string | null
          bearer_id?: number | null
          bearer_name?: string | null
          condition_type_id?: string | null
          condition_type_name?: string | null
          contrato_id?: number | null
          first_payment?: string | null
          id?: number
          indexer_id?: number | null
          indexer_name?: string | null
          installments_number?: number | null
          interest_percentage?: number | null
          interest_type?: string | null
          match_maturities?: string | null
          months_grace_period?: number | null
          open_installments_number?: number | null
          order_number?: number | null
          order_number_remade_installments?: number | null
          outstanding_balance?: number | null
          paid_before_contract_additive?: boolean | null
          sequence_id?: number | null
          status?: string | null
          synced_at?: string | null
          total_value?: number | null
          total_value_interest?: number | null
        }
        Update: {
          amount_paid?: number | null
          base_date?: string | null
          base_date_interest?: string | null
          bearer_id?: number | null
          bearer_name?: string | null
          condition_type_id?: string | null
          condition_type_name?: string | null
          contrato_id?: number | null
          first_payment?: string | null
          id?: number
          indexer_id?: number | null
          indexer_name?: string | null
          installments_number?: number | null
          interest_percentage?: number | null
          interest_type?: string | null
          match_maturities?: string | null
          months_grace_period?: number | null
          open_installments_number?: number | null
          order_number?: number | null
          order_number_remade_installments?: number | null
          outstanding_balance?: number | null
          paid_before_contract_additive?: boolean | null
          sequence_id?: number | null
          status?: string | null
          synced_at?: string | null
          total_value?: number | null
          total_value_interest?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sienge_contrato_pagamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "sienge_contratos_de_vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      sienge_contrato_unidades: {
        Row: {
          contrato_id: number
          main: boolean | null
          participation_percentage: number | null
          synced_at: string | null
          unidade_id: number
        }
        Insert: {
          contrato_id: number
          main?: boolean | null
          participation_percentage?: number | null
          synced_at?: string | null
          unidade_id: number
        }
        Update: {
          contrato_id?: number
          main?: boolean | null
          participation_percentage?: number | null
          synced_at?: string | null
          unidade_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sienge_contrato_unidades_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "sienge_contratos_de_vendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sienge_contrato_unidades_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "sienge_unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      sienge_contratos_de_vendas: {
        Row: {
          accounting_date: string | null
          cancellation_date: string | null
          cancellation_payable_bill_id: number | null
          cancellation_reason: string | null
          company_id: number | null
          company_name: string | null
          contains_remade_installments: boolean | null
          contract_date: string | null
          correction_type: string | null
          creation_date: string | null
          daily_late_interest_value: number | null
          discount_percentage: number | null
          discount_type: string | null
          enterprise_id: number | null
          enterprise_name: string | null
          expected_delivery_date: string | null
          financial_institution_date: string | null
          financial_institution_number: string | null
          fine_rate: number | null
          id: number
          interest_percentage: number | null
          interest_type: string | null
          internal_company_id: number | null
          internal_enterprise_id: number | null
          issue_date: string | null
          keys_delivered_at: string | null
          last_update_date: string | null
          late_interest_calculation_type: string | null
          number: string | null
          pro_rata_indexer: number | null
          raw_data: Json | null
          receivable_bill_id: number | null
          situation: string | null
          special_clause: string | null
          synced_at: string | null
          total_cancellation_amount: number | null
          total_selling_value: number | null
          value: number | null
        }
        Insert: {
          accounting_date?: string | null
          cancellation_date?: string | null
          cancellation_payable_bill_id?: number | null
          cancellation_reason?: string | null
          company_id?: number | null
          company_name?: string | null
          contains_remade_installments?: boolean | null
          contract_date?: string | null
          correction_type?: string | null
          creation_date?: string | null
          daily_late_interest_value?: number | null
          discount_percentage?: number | null
          discount_type?: string | null
          enterprise_id?: number | null
          enterprise_name?: string | null
          expected_delivery_date?: string | null
          financial_institution_date?: string | null
          financial_institution_number?: string | null
          fine_rate?: number | null
          id: number
          interest_percentage?: number | null
          interest_type?: string | null
          internal_company_id?: number | null
          internal_enterprise_id?: number | null
          issue_date?: string | null
          keys_delivered_at?: string | null
          last_update_date?: string | null
          late_interest_calculation_type?: string | null
          number?: string | null
          pro_rata_indexer?: number | null
          raw_data?: Json | null
          receivable_bill_id?: number | null
          situation?: string | null
          special_clause?: string | null
          synced_at?: string | null
          total_cancellation_amount?: number | null
          total_selling_value?: number | null
          value?: number | null
        }
        Update: {
          accounting_date?: string | null
          cancellation_date?: string | null
          cancellation_payable_bill_id?: number | null
          cancellation_reason?: string | null
          company_id?: number | null
          company_name?: string | null
          contains_remade_installments?: boolean | null
          contract_date?: string | null
          correction_type?: string | null
          creation_date?: string | null
          daily_late_interest_value?: number | null
          discount_percentage?: number | null
          discount_type?: string | null
          enterprise_id?: number | null
          enterprise_name?: string | null
          expected_delivery_date?: string | null
          financial_institution_date?: string | null
          financial_institution_number?: string | null
          fine_rate?: number | null
          id?: number
          interest_percentage?: number | null
          interest_type?: string | null
          internal_company_id?: number | null
          internal_enterprise_id?: number | null
          issue_date?: string | null
          keys_delivered_at?: string | null
          last_update_date?: string | null
          late_interest_calculation_type?: string | null
          number?: string | null
          pro_rata_indexer?: number | null
          raw_data?: Json | null
          receivable_bill_id?: number | null
          situation?: string | null
          special_clause?: string | null
          synced_at?: string | null
          total_cancellation_amount?: number | null
          total_selling_value?: number | null
          value?: number | null
        }
        Relationships: []
      }
      sienge_corretores: {
        Row: {
          id: number
        }
        Insert: {
          id: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      sienge_parcelas_receber: {
        Row: {
          annual_correction: boolean | null
          balance_amount: number | null
          base_date: string | null
          bearer_id: number | null
          bill_correction_date: string | null
          bill_date: string | null
          bill_document: string | null
          bill_emission_date: string | null
          bill_id: number
          bill_last_renegotiation_date: string | null
          bill_oldest_installment_date: string | null
          bill_private_area: number | null
          bill_revoked_date: string | null
          business_area_id: number | null
          business_area_name: string | null
          calculation_date: string | null
          client_id: number | null
          client_name: string | null
          company_id: number | null
          company_name: string | null
          corrected_balance_amount: number | null
          correction_type: string | null
          cost_center_id: number | null
          cost_center_name: string | null
          current_balance: number | null
          current_balance_with_addition: number | null
          defaulter_situation: string | null
          discount_amount: number | null
          document_forecast: string | null
          document_identification_id: string | null
          document_identification_name: string | null
          document_number: string | null
          due_date: string | null
          embedded_interest_amount: number | null
          first_payment_date: string | null
          generated_billet: boolean | null
          indexer_id: number | null
          indexer_name: string | null
          installment_base_date: string | null
          installment_id: number
          installment_number: string | null
          installment_situation: string | null
          interest_base_date: string | null
          interest_rate: number | null
          interest_type: string | null
          issue_date: string | null
          last_payment_date: string | null
          main_unit: string | null
          origin_id: string | null
          original_amount: number | null
          payment_status: string | null
          payment_term_description: string | null
          payment_term_id: string | null
          periodicity_type: string | null
          raw_data: Json | null
          receipts: Json | null
          receipts_categories: Json | null
          receipts_count: number | null
          sent_to_scriptural_charge: boolean | null
          sub_judicie: string | null
          synced_at: string | null
          tax_amount: number | null
          total_paid_net: number | null
          units: Json | null
        }
        Insert: {
          annual_correction?: boolean | null
          balance_amount?: number | null
          base_date?: string | null
          bearer_id?: number | null
          bill_correction_date?: string | null
          bill_date?: string | null
          bill_document?: string | null
          bill_emission_date?: string | null
          bill_id: number
          bill_last_renegotiation_date?: string | null
          bill_oldest_installment_date?: string | null
          bill_private_area?: number | null
          bill_revoked_date?: string | null
          business_area_id?: number | null
          business_area_name?: string | null
          calculation_date?: string | null
          client_id?: number | null
          client_name?: string | null
          company_id?: number | null
          company_name?: string | null
          corrected_balance_amount?: number | null
          correction_type?: string | null
          cost_center_id?: number | null
          cost_center_name?: string | null
          current_balance?: number | null
          current_balance_with_addition?: number | null
          defaulter_situation?: string | null
          discount_amount?: number | null
          document_forecast?: string | null
          document_identification_id?: string | null
          document_identification_name?: string | null
          document_number?: string | null
          due_date?: string | null
          embedded_interest_amount?: number | null
          first_payment_date?: string | null
          generated_billet?: boolean | null
          indexer_id?: number | null
          indexer_name?: string | null
          installment_base_date?: string | null
          installment_id: number
          installment_number?: string | null
          installment_situation?: string | null
          interest_base_date?: string | null
          interest_rate?: number | null
          interest_type?: string | null
          issue_date?: string | null
          last_payment_date?: string | null
          main_unit?: string | null
          origin_id?: string | null
          original_amount?: number | null
          payment_status?: string | null
          payment_term_description?: string | null
          payment_term_id?: string | null
          periodicity_type?: string | null
          raw_data?: Json | null
          receipts?: Json | null
          receipts_categories?: Json | null
          receipts_count?: number | null
          sent_to_scriptural_charge?: boolean | null
          sub_judicie?: string | null
          synced_at?: string | null
          tax_amount?: number | null
          total_paid_net?: number | null
          units?: Json | null
        }
        Update: {
          annual_correction?: boolean | null
          balance_amount?: number | null
          base_date?: string | null
          bearer_id?: number | null
          bill_correction_date?: string | null
          bill_date?: string | null
          bill_document?: string | null
          bill_emission_date?: string | null
          bill_id?: number
          bill_last_renegotiation_date?: string | null
          bill_oldest_installment_date?: string | null
          bill_private_area?: number | null
          bill_revoked_date?: string | null
          business_area_id?: number | null
          business_area_name?: string | null
          calculation_date?: string | null
          client_id?: number | null
          client_name?: string | null
          company_id?: number | null
          company_name?: string | null
          corrected_balance_amount?: number | null
          correction_type?: string | null
          cost_center_id?: number | null
          cost_center_name?: string | null
          current_balance?: number | null
          current_balance_with_addition?: number | null
          defaulter_situation?: string | null
          discount_amount?: number | null
          document_forecast?: string | null
          document_identification_id?: string | null
          document_identification_name?: string | null
          document_number?: string | null
          due_date?: string | null
          embedded_interest_amount?: number | null
          first_payment_date?: string | null
          generated_billet?: boolean | null
          indexer_id?: number | null
          indexer_name?: string | null
          installment_base_date?: string | null
          installment_id?: number
          installment_number?: string | null
          installment_situation?: string | null
          interest_base_date?: string | null
          interest_rate?: number | null
          interest_type?: string | null
          issue_date?: string | null
          last_payment_date?: string | null
          main_unit?: string | null
          origin_id?: string | null
          original_amount?: number | null
          payment_status?: string | null
          payment_term_description?: string | null
          payment_term_id?: string | null
          periodicity_type?: string | null
          raw_data?: Json | null
          receipts?: Json | null
          receipts_categories?: Json | null
          receipts_count?: number | null
          sent_to_scriptural_charge?: boolean | null
          sub_judicie?: string | null
          synced_at?: string | null
          tax_amount?: number | null
          total_paid_net?: number | null
          units?: Json | null
        }
        Relationships: []
      }
      sienge_unidades: {
        Row: {
          commercial_stock: string | null
          contract_id: number | null
          enterprise_id: number | null
          id: number
          name: string | null
          synced_at: string | null
          terrain_value: number | null
        }
        Insert: {
          commercial_stock?: string | null
          contract_id?: number | null
          enterprise_id?: number | null
          id: number
          name?: string | null
          synced_at?: string | null
          terrain_value?: number | null
        }
        Update: {
          commercial_stock?: string | null
          contract_id?: number | null
          enterprise_id?: number | null
          id?: number
          name?: string | null
          synced_at?: string | null
          terrain_value?: number | null
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
      talents_activity_areas: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      talents_activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          meta: Json | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          meta?: Json | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          meta?: Json | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      talents_applications: {
        Row: {
          applied_at: string | null
          candidate_email: string | null
          candidate_id: string
          candidate_name: string | null
          closed_at: string | null
          closed_reason: string | null
          created_at: string | null
          created_by: string | null
          id: string
          job_company: string | null
          job_id: string
          job_title: string | null
          last_activity: string | null
          notes: Json | null
          rating: number | null
          status: string
        }
        Insert: {
          applied_at?: string | null
          candidate_email?: string | null
          candidate_id: string
          candidate_name?: string | null
          closed_at?: string | null
          closed_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_company?: string | null
          job_id: string
          job_title?: string | null
          last_activity?: string | null
          notes?: Json | null
          rating?: number | null
          status?: string
        }
        Update: {
          applied_at?: string | null
          candidate_email?: string | null
          candidate_id?: string
          candidate_name?: string | null
          closed_at?: string | null
          closed_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          job_company?: string | null
          job_id?: string
          job_title?: string | null
          last_activity?: string | null
          notes?: Json | null
          rating?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "talents_applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "talents_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talents_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "talents_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      talents_candidates: {
        Row: {
          age: number | null
          birth_date: string | null
          can_relocate: string | null
          certifications: string | null
          children_count: string | null
          city: string | null
          closed_at: string | null
          courses: string | null
          created_at: string | null
          created_by: string | null
          cv_url: string | null
          deleted_at: string | null
          education: string | null
          email: string
          email_secondary: string | null
          experience: string | null
          free_field: string | null
          full_name: string | null
          graduation_date: string | null
          has_license: string | null
          id: string
          institution: string | null
          interest_areas: string | null
          interview1_date: string | null
          interview1_notes: string | null
          interview2_date: string | null
          interview2_notes: string | null
          is_studying: string | null
          manager_feedback: string | null
          marital_status: string | null
          origin: string | null
          original_timestamp: string | null
          phone: string
          photo_url: string | null
          portfolio_url: string | null
          professional_references: string | null
          referral: string | null
          rejection_reason: string | null
          return_date: string | null
          return_notes: string | null
          return_sent: string | null
          salary_expectation: string | null
          schooling_level: string | null
          source: string | null
          starred: boolean | null
          status: string | null
          tags: string[] | null
          test_results: string | null
          type_of_app: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          birth_date?: string | null
          can_relocate?: string | null
          certifications?: string | null
          children_count?: string | null
          city?: string | null
          closed_at?: string | null
          courses?: string | null
          created_at?: string | null
          created_by?: string | null
          cv_url?: string | null
          deleted_at?: string | null
          education?: string | null
          email: string
          email_secondary?: string | null
          experience?: string | null
          free_field?: string | null
          full_name?: string | null
          graduation_date?: string | null
          has_license?: string | null
          id?: string
          institution?: string | null
          interest_areas?: string | null
          interview1_date?: string | null
          interview1_notes?: string | null
          interview2_date?: string | null
          interview2_notes?: string | null
          is_studying?: string | null
          manager_feedback?: string | null
          marital_status?: string | null
          origin?: string | null
          original_timestamp?: string | null
          phone: string
          photo_url?: string | null
          portfolio_url?: string | null
          professional_references?: string | null
          referral?: string | null
          rejection_reason?: string | null
          return_date?: string | null
          return_notes?: string | null
          return_sent?: string | null
          salary_expectation?: string | null
          schooling_level?: string | null
          source?: string | null
          starred?: boolean | null
          status?: string | null
          tags?: string[] | null
          test_results?: string | null
          type_of_app?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          birth_date?: string | null
          can_relocate?: string | null
          certifications?: string | null
          children_count?: string | null
          city?: string | null
          closed_at?: string | null
          courses?: string | null
          created_at?: string | null
          created_by?: string | null
          cv_url?: string | null
          deleted_at?: string | null
          education?: string | null
          email?: string
          email_secondary?: string | null
          experience?: string | null
          free_field?: string | null
          full_name?: string | null
          graduation_date?: string | null
          has_license?: string | null
          id?: string
          institution?: string | null
          interest_areas?: string | null
          interview1_date?: string | null
          interview1_notes?: string | null
          interview2_date?: string | null
          interview2_notes?: string | null
          is_studying?: string | null
          manager_feedback?: string | null
          marital_status?: string | null
          origin?: string | null
          original_timestamp?: string | null
          phone?: string
          photo_url?: string | null
          portfolio_url?: string | null
          professional_references?: string | null
          referral?: string | null
          rejection_reason?: string | null
          return_date?: string | null
          return_notes?: string | null
          return_sent?: string | null
          salary_expectation?: string | null
          schooling_level?: string | null
          source?: string | null
          starred?: boolean | null
          status?: string | null
          tags?: string[] | null
          test_results?: string | null
          type_of_app?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      talents_cities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      talents_companies: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      talents_interaction_types: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      talents_interactions: {
        Row: {
          candidate_id: string
          created_at: string
          created_by_email: string | null
          created_by_name: string | null
          id: string
          interaction_type: string
          notes: string | null
          occurred_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by_email?: string | null
          created_by_name?: string | null
          id?: string
          interaction_type: string
          notes?: string | null
          occurred_at: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by_email?: string | null
          created_by_name?: string | null
          id?: string
          interaction_type?: string
          notes?: string | null
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talents_interactions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "talents_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      talents_job_levels: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      talents_jobs: {
        Row: {
          approved_by: string | null
          benefits: string | null
          city: string | null
          code: string | null
          company: string
          contract_type: string | null
          created_at: string | null
          deadline: string | null
          deleted_at: string | null
          description: string | null
          function: string | null
          hiring_manager: string | null
          id: string
          interest_area: string | null
          position: string | null
          posting_channels: Json | null
          priority: string | null
          recruiter: string | null
          requested_by_user_id: string | null
          requirements: string | null
          salary_range: string | null
          sector: string | null
          status: string
          title: string
          updated_at: string | null
          vacancies: number | null
          work_model: string | null
          workload: string | null
        }
        Insert: {
          approved_by?: string | null
          benefits?: string | null
          city?: string | null
          code?: string | null
          company: string
          contract_type?: string | null
          created_at?: string | null
          deadline?: string | null
          deleted_at?: string | null
          description?: string | null
          function?: string | null
          hiring_manager?: string | null
          id?: string
          interest_area?: string | null
          position?: string | null
          posting_channels?: Json | null
          priority?: string | null
          recruiter?: string | null
          requested_by_user_id?: string | null
          requirements?: string | null
          salary_range?: string | null
          sector?: string | null
          status?: string
          title: string
          updated_at?: string | null
          vacancies?: number | null
          work_model?: string | null
          workload?: string | null
        }
        Update: {
          approved_by?: string | null
          benefits?: string | null
          city?: string | null
          code?: string | null
          company?: string
          contract_type?: string | null
          created_at?: string | null
          deadline?: string | null
          deleted_at?: string | null
          description?: string | null
          function?: string | null
          hiring_manager?: string | null
          id?: string
          interest_area?: string | null
          position?: string | null
          posting_channels?: Json | null
          priority?: string | null
          recruiter?: string | null
          requested_by_user_id?: string | null
          requirements?: string | null
          salary_range?: string | null
          sector?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          vacancies?: number | null
          work_model?: string | null
          workload?: string | null
        }
        Relationships: []
      }
      talents_mappings: {
        Row: {
          candidate_id: string
          city: string | null
          created_at: string | null
          id: string
          mapped_by: string | null
          mapped_by_name: string | null
          notes: string | null
          position_id: string | null
          position_name: string | null
          priority: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          city?: string | null
          created_at?: string | null
          id?: string
          mapped_by?: string | null
          mapped_by_name?: string | null
          notes?: string | null
          position_id?: string | null
          position_name?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          city?: string | null
          created_at?: string | null
          id?: string
          mapped_by?: string | null
          mapped_by_name?: string | null
          notes?: string | null
          position_id?: string | null
          position_name?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talents_mappings_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "talents_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talents_mappings_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "talents_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      talents_positions: {
        Row: {
          activity_area_id: string | null
          created_at: string | null
          id: string
          level: string | null
          level_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          activity_area_id?: string | null
          created_at?: string | null
          id?: string
          level?: string | null
          level_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          activity_area_id?: string | null
          created_at?: string | null
          id?: string
          level?: string | null
          level_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talents_positions_activity_area_id_fkey"
            columns: ["activity_area_id"]
            isOneToOne: false
            referencedRelation: "talents_activity_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talents_positions_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "talents_job_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      talents_sectors: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      talents_user_roles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string | null
          photo: string | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          name?: string | null
          photo?: string | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string | null
          photo?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tipos_arquivo: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      tipos_atividade: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
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
      crm_relatorio_vendas_diario: {
        Row: {
          contatos_feitos: number | null
          data: string | null
          empreendimento_id: string | null
          fichas_assinadas: number | null
          leads_recebidos: number | null
          negociacoes_criadas: number | null
          perdas: number | null
          responsavel_id: string | null
          vendas: number | null
          visitas_agendadas: number | null
          visitas_realizadas: number | null
        }
        Relationships: []
      }
      financeiro_mv_clientes_inadimplentes: {
        Row: {
          client_id: number | null
          cpf: string | null
          name: string | null
          parcela_mais_antiga: string | null
          qtd_parcelas_vencidas: number | null
          valor_em_aberto: number | null
        }
        Relationships: []
      }
      financeiro_vw_clientes_inadimplentes: {
        Row: {
          client_id: number | null
          cpf: string | null
          name: string | null
          parcela_mais_antiga: string | null
          qtd_parcelas_vencidas: number | null
          valor_em_aberto: number | null
        }
        Relationships: []
      }
      financeiro_vw_contratos_por_empreendimento: {
        Row: {
          enterprise_name: string | null
          qtd_contratos_ativos: number | null
          vgv_ativo: number | null
        }
        Relationships: []
      }
      financeiro_vw_inadimplencia_total: {
        Row: {
          qtd_clientes: number | null
          qtd_parcelas_vencidas: number | null
          valor_em_aberto: number | null
        }
        Relationships: []
      }
      financeiro_vw_recebimentos_mensal: {
        Row: {
          mes: string | null
          qtd_parcelas_pagas: number | null
          total_recebido: number | null
        }
        Relationships: []
      }
      mv_empresas: {
        Row: {
          company_id: number | null
          company_name: string | null
        }
        Relationships: []
      }
      vw_contrato_partes: {
        Row: {
          address_number: string | null
          birth_date: string | null
          birth_place: string | null
          city: string | null
          civil_status: string | null
          cliente_id: number | null
          cliente_modified_at: string | null
          contrato_id: number | null
          cpf: string | null
          email: string | null
          father_name: string | null
          is_main: boolean | null
          is_spouse: boolean | null
          issue_date_identity_card: string | null
          issuing_body: string | null
          link_synced_at: string | null
          mother_name: string | null
          nationality: string | null
          neighborhood: string | null
          nome: string | null
          number_identity_card: string | null
          participation_percentage: number | null
          profession: string | null
          sex: string | null
          state: string | null
          street_name: string | null
          telefone_comercial: string | null
          telefone_principal: string | null
          zip_code: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "sienge_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contrato"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "sienge_contratos_de_vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_lote_disponibilidade: {
        Row: {
          commercial_stock: string | null
          disponivel: boolean | null
          empreendimento: string | null
          lote_id: string | null
          num_lote: string | null
          reserva_tecnica: boolean | null
          sienge_unidade_id: number | null
          situacao: string | null
        }
        Relationships: []
      }
      vw_parcelas_abertas: {
        Row: {
          bill_document: string | null
          bill_id: number | null
          business_area_name: string | null
          client_id: number | null
          client_name: string | null
          company_id: number | null
          company_name: string | null
          corrected_balance_amount: number | null
          current_balance: number | null
          current_balance_with_addition: number | null
          discount_amount: number | null
          document_identification_id: string | null
          document_identification_name: string | null
          due_date: string | null
          indexer_name: string | null
          installment_number: string | null
          installment_situation: string | null
          issue_date: string | null
          last_payment_date: string | null
          main_unit: string | null
          original_amount: number | null
          payment_status: string | null
          payment_term_description: string | null
          total_paid_net: number | null
        }
        Insert: {
          bill_document?: string | null
          bill_id?: number | null
          business_area_name?: string | null
          client_id?: number | null
          client_name?: string | null
          company_id?: number | null
          company_name?: string | null
          corrected_balance_amount?: number | null
          current_balance?: number | null
          current_balance_with_addition?: number | null
          discount_amount?: number | null
          document_identification_id?: string | null
          document_identification_name?: string | null
          due_date?: string | null
          indexer_name?: string | null
          installment_number?: string | null
          installment_situation?: string | null
          issue_date?: string | null
          last_payment_date?: string | null
          main_unit?: string | null
          original_amount?: number | null
          payment_status?: string | null
          payment_term_description?: string | null
          total_paid_net?: number | null
        }
        Update: {
          bill_document?: string | null
          bill_id?: number | null
          business_area_name?: string | null
          client_id?: number | null
          client_name?: string | null
          company_id?: number | null
          company_name?: string | null
          corrected_balance_amount?: number | null
          current_balance?: number | null
          current_balance_with_addition?: number | null
          discount_amount?: number | null
          document_identification_id?: string | null
          document_identification_name?: string | null
          due_date?: string | null
          indexer_name?: string | null
          installment_number?: string | null
          installment_situation?: string | null
          issue_date?: string | null
          last_payment_date?: string | null
          main_unit?: string | null
          original_amount?: number | null
          payment_status?: string | null
          payment_term_description?: string | null
          total_paid_net?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      esquadro_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["esquadro_app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      export_deals_empreendimento: {
        Args: never
        Returns: {
          cliente_nome: string
          empreendimento_id: string
          empreendimento_nome: string
          id: string
          numero_lote: string
          preco_lote: number
          status: string
          versao_tabela: string
        }[]
      }
      financeiro_fn_clientes_inadimplentes: {
        Args: {
          _enterprises?: string[]
          _limit?: number
          _offset?: number
          _search?: string
          _sort?: string
        }
        Returns: {
          client_id: number
          cpf: string
          name: string
          parcela_mais_antiga: string
          qtd_parcelas_vencidas: number
          total_count: number
          valor_em_aberto: number
        }[]
      }
      financeiro_fn_refresh_inadimplentes: { Args: never; Returns: undefined }
      fn_norm_lote: { Args: { p: string }; Returns: string }
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
      get_dados_contrato: { Args: { p_bill_id: number }; Returns: Json }
      get_eap_avanco_sums: {
        Args: { p_obra_id?: string }
        Returns: {
          eap_item_id: string
          sum_quantidade_dia: number
        }[]
      }
      get_empreendimentos: {
        Args: never
        Returns: {
          enterprise_name: string
        }[]
      }
      get_empresas_abertas: {
        Args: never
        Returns: {
          company_id: number
          company_name: string
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
      import_anotacoes: {
        Args: { dados: Json }
        Returns: {
          inserted: number
          matched: number
          no_match: number
          skipped: number
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      paver_has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      public_submit_candidate: { Args: { candidate_data: Json }; Returns: Json }
      registros_get_lotes_without_registros: {
        Args: never
        Returns: {
          created_at: string
          empreendimento_id: string
          id: string
          numero: string
          sienge_unit_id: number
          valor_avista: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "registros_lotes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      rh_get_all_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["rh_app_role"]
        }[]
      }
      rh_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["rh_app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      talents_has_privileged_role: {
        Args: { p_min_role: string }
        Returns: boolean
      }
      talents_has_staff_access: { Args: never; Returns: boolean }
      talents_is_admin: { Args: never; Returns: boolean }
      talents_is_developer: { Args: never; Returns: boolean }
      talents_is_editor_or_admin: { Args: never; Returns: boolean }
      update_corretor_cadastro_completo: {
        Args: {
          p_bairro?: string
          p_banco_agencia?: string
          p_banco_chave_pix?: string
          p_banco_conta?: string
          p_banco_nome?: string
          p_banco_tipo?: string
          p_cep?: string
          p_cidade?: string
          p_cnpj?: string
          p_cpf?: string
          p_creci?: string
          p_email?: string
          p_email_secundario?: string
          p_endereco?: string
          p_id: string
          p_nome_exibicao?: string
          p_razao_social?: string
          p_telefone?: string
          p_tipo?: string
          p_uf?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
      cobrancas_acao_tipo: "realizada" | "agendada"
      cobrancas_empreendimento:
        | "Aurora"
        | "Erico Verissimo"
        | "Morada da Coxilha"
        | "Algarve"
        | "Montecarlo"
        | "Ilha dos Açores"
        | "Lorena 1"
        | "Lorena 2"
        | "Jardim do Parque"
      cobrancas_responsavel: "Gabrielle" | "Antonio" | "Lais" | "Suelen"
      cobrancas_role: "admin" | "comum"
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
        | "analise_interna_realizada"
        | "minuta_enviada"
      paver_app_role: "admin" | "engenharia"
      permuta_status: "incerto" | "nao" | "sim"
      registros_user_role: "gestor" | "operador" | "leitor"
      rh_app_role: "admin" | "coordenador" | "usuario"
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
      cobrancas_acao_tipo: ["realizada", "agendada"],
      cobrancas_empreendimento: [
        "Aurora",
        "Erico Verissimo",
        "Morada da Coxilha",
        "Algarve",
        "Montecarlo",
        "Ilha dos Açores",
        "Lorena 1",
        "Lorena 2",
        "Jardim do Parque",
      ],
      cobrancas_responsavel: ["Gabrielle", "Antonio", "Lais", "Suelen"],
      cobrancas_role: ["admin", "comum"],
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
        "analise_interna_realizada",
        "minuta_enviada",
      ],
      paver_app_role: ["admin", "engenharia"],
      permuta_status: ["incerto", "nao", "sim"],
      registros_user_role: ["gestor", "operador", "leitor"],
      rh_app_role: ["admin", "coordenador", "usuario"],
      tipo_anexo_gleba: [
        "pesquisa_mercado",
        "planilha_viabilidade",
        "matricula_imovel",
      ],
      tipo_proposta: ["compra", "parceria", "mista"],
    },
  },
} as const
