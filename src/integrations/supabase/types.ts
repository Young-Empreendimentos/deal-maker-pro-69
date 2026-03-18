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
          created_at: string
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
          created_at?: string
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
          id: number
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
          created_at?: string
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
          executado_em: string
          id: number
          mensagem: string | null
          registros_importados: number | null
          status: string | null
        }
        Insert: {
          empreendimento_id?: number | null
          empresa_id?: number | null
          executado_em?: string
          id: number
          mensagem?: string | null
          registros_importados?: number | null
          status?: string | null
        }
        Update: {
          empreendimento_id?: number | null
          empresa_id?: number | null
          executado_em?: string
          id?: number
          mensagem?: string | null
          registros_importados?: number | null
          status?: string | null
        }
        Relationships: []
      }
      cobranca_inadimplencia: {
        Row: {
          acrescimos: number | null
          atraso_atualizado: number | null
          atraso_desde: string | null
          atualizado_em: string
          cliente_cpf: string | null
          cliente_email: string | null
          cliente_endereco: string | null
          cliente_id: number | null
          cliente_telefone: string | null
          contrato_id: number | null
          criado_em: string
          dados_originais: Json | null
          data_contrato: string | null
          data_venda: string | null
          documento_titulo: string | null
          empreendimento_id: number | null
          empreendimento_nome: string | null
          empresa_id: number | null
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
          atualizado_em?: string
          cliente_cpf?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_id?: number | null
          cliente_telefone?: string | null
          contrato_id?: number | null
          criado_em?: string
          dados_originais?: Json | null
          data_contrato?: string | null
          data_venda?: string | null
          documento_titulo?: string | null
          empreendimento_id?: number | null
          empreendimento_nome?: string | null
          empresa_id?: number | null
          id: number
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
          atualizado_em?: string
          cliente_cpf?: string | null
          cliente_email?: string | null
          cliente_endereco?: string | null
          cliente_id?: number | null
          cliente_telefone?: string | null
          contrato_id?: number | null
          criado_em?: string
          dados_originais?: Json | null
          data_contrato?: string | null
          data_venda?: string | null
          documento_titulo?: string | null
          empreendimento_id?: number | null
          empreendimento_nome?: string | null
          empresa_id?: number | null
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
        Relationships: []
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
      cobranca_parcelas_inadimplencia: {
        Row: {
          atualizado_em: string | null
          cliente_id: number | null
          criado_em: string | null
          data_vencimento: string
          dias_atraso: number | null
          documento_titulo: string | null
          empreendimento_id: number
          empresa_id: number
          id: number
          inadimplencia_id: number | null
          numero_parcela: string | null
          saldo_atual: number | null
          saldo_com_acrescimos: number | null
          situacao: string | null
          titulo_id: number | null
          valor_original: number
        }
        Insert: {
          atualizado_em?: string | null
          cliente_id?: number | null
          criado_em?: string | null
          data_vencimento: string
          dias_atraso?: number | null
          documento_titulo?: string | null
          empreendimento_id: number
          empresa_id: number
          id?: number
          inadimplencia_id?: number | null
          numero_parcela?: string | null
          saldo_atual?: number | null
          saldo_com_acrescimos?: number | null
          situacao?: string | null
          titulo_id?: number | null
          valor_original: number
        }
        Update: {
          atualizado_em?: string | null
          cliente_id?: number | null
          criado_em?: string | null
          data_vencimento?: string
          dias_atraso?: number | null
          documento_titulo?: string | null
          empreendimento_id?: number
          empresa_id?: number
          id?: number
          inadimplencia_id?: number | null
          numero_parcela?: string | null
          saldo_atual?: number | null
          saldo_com_acrescimos?: number | null
          situacao?: string | null
          titulo_id?: number | null
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "cobranca_parcelas_inadimplencia_inadimplencia_id_fkey"
            columns: ["inadimplencia_id"]
            isOneToOne: false
            referencedRelation: "cobranca_inadimplencia"
            referencedColumns: ["id"]
          },
        ]
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
      get_eap_avanco_sums: {
        Args: { p_obra_id?: string }
        Returns: {
          eap_item_id: string
          sum_quantidade_dia: number
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
      paver_has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
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
      paver_app_role: "admin" | "engenharia"
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
      paver_app_role: ["admin", "engenharia"],
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
