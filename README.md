# Mini Fazenda — Ateliê independente

Este repositório serve **o editor administrativo completo**, o menu exportado para jogadores, os GIFs/imagens e o catálogo em JSON. O jogo continua no repositório `mini-fazenda/mini-fazenda`.

## Primeira instalação (uma vez)

1. Este repositório `mini-fazenda/Atelie-minifazenda` já foi criado. Adicione os três pacotes `publication-XX.zip` fornecidos na instalação.
2. Extraia o ZIP de instalação entregue pelo ChatGPT. No novo repositório, coloque `.github/workflows/deploy.yml`, `README.md` e **todos os arquivos `publication-XX.zip`** na raiz (os pacotes individuais ficam abaixo de 25 MB).
3. No GitHub, abra **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Em **Actions**, confira a execução de **Publicar Atelie Mini Fazenda** e os testes de arquivos e IDs. Nenhum arquivo do Firebase é alterado.
5. Após a publicação, abra:
   - Editor: `https://mini-fazenda.github.io/Atelie-minifazenda/`
   - Menu dos jogadores: `https://mini-fazenda.github.io/Atelie-minifazenda/menu.html`
   - Catálogo: `https://mini-fazenda.github.io/Atelie-minifazenda/catalog.json`

## Para adicionar uma roupa, cabelo, acessório ou GIF

Abra o editor Pages, faça todas as edições normalmente, incluindo as quatro poses, as duas vistas e os preços. Clique em **Publicar catálogo e menu**. O navegador baixa `publication-01.zip`, `publication-02.zip` etc. Permita downloads múltiplos, se ele pedir. No GitHub, use **Add file → Upload files**, selecione TODOS os novos `publication-*.zip` e faça **um único commit** para `main`. Substitua os arquivos `publication-XX.zip` antigos que tiverem o mesmo nome. Arquivos de números maiores de uma publicação antiga não são usados: o manifesto do novo pacote determina quais arquivos fazem parte da atualização.

O workflow valida o pacote completo, imagens, GIFs, hashes, preços, IDs, poses e a correspondência exata entre versão do menu e catálogo antes de publicar. Se os ZIPs ficarem incompletos ou forem inválidos, a atualização falha; o site publicado anteriormente continua disponível.

**O botão Publicar gera o pacote**, mas não envia automaticamente para o GitHub: isso exige uma autenticação de escrita. Não coloque token GitHub em código HTML público. A única etapa manual é enviar os ZIPs ao repositório, sem editar o jogo.

## Compatibilidade e segurança

- Os IDs publicados não devem ser renomeados. O editor consulta o catálogo atual antes de exportar e inclui novamente peças antigas que tenham sido excluídas da edição local. Se a consulta ao catálogo publicado falhar, a exportação é bloqueada.
- As imagens têm nomes derivados de seu hash SHA-256; a versão do catálogo é derivada do projeto. Atualizar uma peça não substitui silenciosamente o arquivo antigo no cache.
- O jogo integra o menu por um iframe com mensagens validadas por origem. É o **jogo** que confere o saldo e desconta as moedas; o menu não grava nem acessa Firebase.
- Uma falha do Pages não modifica os saves existentes. Na indisponibilidade, o jogo usa o último catálogo válido ou o menu legado integrado.
- **Limite de segurança da economia:** o saldo atual e as compras são processados em JavaScript no navegador. Isso corrige o bug funcional de compra sem saldo, mas não impede trapaça por alteração do cliente. Segurança contra adulteração exigiria validação de compra no servidor ou regras transacionais específicas, e isso não foi implantado.
- As configurações Firebase e `database.rules.json` não são modificadas por este repositório.

## Diagnóstico

Se o editor disser que não consegue publicar, abra o site pelo GitHub Pages (HTTPS), e não a cópia HTML aberta por `file://`. Confira se `catalog.json` abre, se os GIFs abrem individualmente e se **Actions** apresenta erros. Depois de publicar, recarregue o jogo para obter o menu novo, ou abra a personalização para verificar a versão atual.