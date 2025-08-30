FlowDesk Ultra - Dashboard Frontend
Esta é a aplicação de frontend do projeto FlowDesk Ultra. Desenvolvida com Next.js e TypeScript, seu objetivo é consumir a API do backend para visualizar os dados de negócio em um dashboard interativo, moderno e responsivo.

🚀 Funcionalidades Planejadas
Visualização de KPIs: Exibição clara dos principais indicadores de performance do negócio.

Dashboards Interativos: Filtros dinâmicos (especialmente por data) que atualizam todos os componentes visuais em tempo real.

Tabelas e Rankings: Apresentação de dados tabulados, como ranking de produtos e performance de vendedores.

Design Responsivo: Experiência de usuário otimizada para desktops, tablets e dispositivos móveis.

Sistema de Alertas: Interface para visualizar alertas de negócio importantes gerados pela API.

🛠️ Pilha Tecnológica
Framework: Next.js (com App Router)

Linguagem: TypeScript

Estilização: Tailwind CSS

Qualidade de Código: ESLint

⚙️ Preparação do Ambiente de Desenvolvimento
Siga estes passos para configurar e executar o projeto localmente.

Pré-requisitos
Node.js: Versão 18.18 ou superior.

Backend Rodando: O servidor da API do backend (projeto flowdesk-ultra-prototype) deve estar em execução em http://localhost:8000.

1. Clonar o Repositório
git clone [https://github.com/PaletotCode/flowdesk-ultra-frontend.git](https://github.com/PaletotCode/flowdesk-ultra-frontend.git)
cd flowdesk-ultra-frontend

2. Instalar as Dependências
Use o npm (ou o gerenciador de pacotes de sua preferência) para instalar as bibliotecas do projeto.

npm install

3. Configurar a Conexão com a API
O frontend precisa saber onde a API do backend está localizada.

Na pasta raiz do projeto (flowdesk-ultra-frontend), crie um arquivo chamado .env.local.

Adicione a seguinte linha a este arquivo. Ela aponta para o endereço do seu servidor de backend.

NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1/relatorio-vend-dev-com-itens

Importante: Sempre que você alterar o arquivo .env.local, é necessário reiniciar o servidor de desenvolvimento do frontend.

▶️ Como Executar a Aplicação
Com o ambiente preparado e o servidor do backend já rodando, inicie o servidor de desenvolvimento do Next.js:

npm run dev

A aplicação estará disponível em http://localhost:3000.

📁 Estrutura do Projeto
src/app/: Contém as páginas principais da aplicação (seguindo a arquitetura do App Router).

src/components/: Onde os componentes reutilizáveis da UI (como cards, tabelas e gráficos) são criados.

.env.local: Arquivo para variáveis de ambiente locais. Não deve ser enviado para o Git.