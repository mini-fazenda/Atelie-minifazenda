# Mini Fazenda — Ateliê independente

Este repositório serve **o editor administrativo completo**, o menu exportado para jogadores, os GIFs/imagens e o catálogo em JSON. O jogo continua no repositório `mini-fazenda/mini-fazenda`.

## Primeira publicação — arquivos já instalados

O repositório já contém o editor administrativo (`index.html`), o menu dos jogadores (`menu.html`), `catalog.json`, `menu-bridge.js`, `release.json` e o workflow `.github/workflows/deploy.yml`.

**Faltam somente os 63 arquivos PNG/GIF do pacote binário**, organizados nos três arquivos de publicação. A conexão GitHub usada para gerar os textos não permite enviar diretamente esses arquivos ZIP binários. Para completar:

1. Baixe e extraia o pacote `atelie-personagens-instalacao.zip` desta conversa.
2. No repositório, abra **Add file → Upload files**. Selecione **somente** `publication-01.zip`, `publication-02.zip` e `publication-03.zip` e faça um único commit na branch `main`. Não descompacte os três ZIPs internos.
3. No GitHub, abra **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Em **Actions**, confirme que a execução **Publicar Atelie Mini Fazenda** passou, incluindo a validação de hashes, IDs, imagens e GIFs.
5. Confira:
   - [Editor](https://mini-fazenda.github.io/Atelie-minifazenda/)
   - [Menu dos jogadores](https://mini-fazenda.github.io/Atelie-minifazenda/menu.html)
   - [Catálogo](https://mini-fazenda.github.io/Atelie-minifazenda/catalog.json)

O PR do jogo [#99](https://github.com/mini-fazenda/mini-fazenda/pull/99) já aponta para este endereço. Ele não deve ser mesclado antes de verificar os arquivos acima e as visitas no jogo.

## Atualização pelo próprio Ateliê online

O editor tem a opção **Publicar online (GitHub)** para enviar o catálogo, o menu e os GIFs/PNGs diretamente do navegador, sem PowerShell e sem fazer upload manual no GitHub.

### Autorizar a conta (primeira vez)

1. Na conta GitHub que tem permissão de escrita no repositório, abra [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new).
2. Gere um token com validade curta. Selecione **Only select repositories** e marque **mini-fazenda/Atelie-minifazenda** (não o repositório do jogo).
3. Em **Repository permissions → Contents**, escolha **Read and write**. Não conceda acesso a outros repositórios.
4. Copie o token e guarde em local seguro. **Nunca coloque o token em arquivos HTML, commits, capturas de tela ou mensagens de chat.**

### Publicar

1. Abra [Ateliê online](https://mini-fazenda.github.io/Atelie-minifazenda/), edite as peças, GIFs, preços e poses normalmente.
2. Clique em **Publicar online (GitHub)**, cole o token na solicitação do navegador e confirme.
3. O editor prepara todos os arquivos e envia os ZIPs em **um único commit Git**, sem deixar versões parciais na branch main.
4. Confirme o indicador verde em [Actions](https://github.com/mini-fazenda/Atelie-minifazenda/actions). Só depois da validação e publicação o novo menu fica disponível para os jogadores.
5. Reabra o menu no jogo. Não é necessário alterar o repositório principal da Mini Fazenda.

O token **não é gravado em cookies, IndexedDB ou localStorage pelo Ateliê**. Ele é usado somente durante o envio atual e precisa ser fornecido novamente na próxima publicação. A autenticação funciona apenas no GitHub Pages oficial do Ateliê.

O botão **Baixar ZIPs (reserva)** preserva o método manual caso a conta, a API ou o token estejam indisponíveis. Os arquivos baixados continuam seguindo a publicação anterior: envie todos juntos em um commit, sem descompactar.

O GitHub Actions valida hashes, IDs, GIFs, poses, preços e versões antes de servir o catálogo. Caso o pacote falhe, o Pages mantém a versão anterior disponível. A publicação online não altera Firebase, moedas ou salvamentos do jogo.

## Compatibilidade e segurança

- Os IDs publicados não devem ser renomeados. O editor consulta o catálogo atual antes de exportar e inclui novamente peças antigas que tenham sido excluídas da edição local. Se a consulta ao catálogo publicado falhar, a exportação é bloqueada.
- As imagens têm nomes derivados de seu hash SHA-256; a versão do catálogo é derivada do projeto. Atualizar uma peça não substitui silenciosamente o arquivo antigo no cache.
- O jogo integra o menu por um iframe com mensagens validadas por origem. É o **jogo** que confere o saldo e desconta as moedas; o menu não grava nem acessa Firebase.
- Uma falha do Pages não modifica os saves existentes. Na indisponibilidade, o jogo usa o último catálogo válido ou o menu legado integrado.
- **Limite de segurança da economia:** o saldo atual e as compras são processados em JavaScript no navegador. Isso corrige o bug funcional de compra sem saldo, mas não impede trapaça por alteração do cliente. Segurança contra adulteração exigiria validação de compra no servidor ou regras transacionais específicas, e isso não foi implantado.
- As configurações Firebase e `database.rules.json` não são modificadas por este repositório.

## Diagnóstico

Se o editor disser que não consegue publicar, abra o site pelo GitHub Pages (HTTPS), e não a cópia HTML aberta por `file://`. Confira se `catalog.json` abre, se os GIFs abrem individualmente e se **Actions** apresenta erros. Depois de publicar, recarregue o jogo para obter o menu novo, ou abra a personalização para verificar a versão atual.