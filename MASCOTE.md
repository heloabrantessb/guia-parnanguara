# Experimento do mascote

Branch: `feat/mascote-caranguejo`.

A base visual e as alterações locais existentes foram preservadas no primeiro commit deste checkout experimental. O commit seguinte contém somente o mascote e sua integração. O checkout original não foi modificado.

## Aplicação

- Tela inicial: ilustração ao lado do convite para conhecer Paranaguá.
- Login: mascote no cabeçalho de boas-vindas.
- Perfil: pose de costas olhando o horizonte junto à ação de sair da conta; visitantes recebem um convite para entrar.
- Rotas: pose com mapa no convite para entrar e no estado sem roteiros.
- Componente reutilizável: `src/components/identidade/MascoteCaranguejo.tsx`.
- Imagem: `src/assets/mascote-caranguejo.png`, com transparência e texto alternativo no componente.

## Origem da imagem

Ferramenta integrada `image_gen`, em modo de edição com fundo transparente. Referência: `Guia Parnanguara_ Identidade Litorânea.png`, fornecida pelo usuário. A imagem é uma adaptação gerada a partir da referência.

Prompt utilizado:

> Use case: background-extraction. Asset type: transparent PNG mascot illustration for Guia Parnanguara mobile app. Input image is the EDIT TARGET brand reference board. Isolate ONLY the large friendly red coral crab explorer in the upper left of the board: preserve its exact recognizable face, smile, round coral body, eye stalks, sand-colored straw hat with dark petroleum teal band, raised waving claw and small petroleum teal travel suitcase with little colored stickers. Remove ALL background, sun, waves, birds, lettering, other logos, layout lines and other characters. Preserve the original friendly flat softly textured illustration style and palette. Full body and suitcase visible, centered, large on square canvas with small clean transparent margin. Actual transparent alpha background, no white matte, no checkerboard, no shadow, no text. Only this single crab with its hat and suitcase. Faithful extraction, not a redesign.

## Verificação

- `npx tsc --noEmit` sem erros.
- Prévia web com larguras de 320 e 390 pixels.
- Tela inicial nos temas claro e escuro; ilustração de login carregada.
- Poses de horizonte e mapa conferidas na web em 320 e 390 pixels; cartão do Perfil conferido nos temas claro e escuro em modo visitante.
- A API não estava disponível na prévia. Esta alteração não modifica a integração com a API.
- Android e iOS ainda precisam de conferência em dispositivo ou emulador.

Para rodar neste checkout: `npx expo start --web --port 8082`.

## Poses adicionais

Preparadas com a ferramenta integrada `image_gen`, a partir da mesma referência, com fundo transparente.

- Horizonte: `src/assets/mascote-horizonte.png`.
- Mapa: `src/assets/mascote-mapa.png`.

Prompt da pose horizonte:

> Use case: background-extraction. Asset type: transparent PNG illustration for Guia Parnanguara app profile farewell area. Input image is the EDIT TARGET brand board. Extract and faithfully reconstruct ONLY the small illustration under CARANGUEJO E HORIZONTE, fourth illustration in middle row: a friendly coral red crab seen from behind wearing a sand straw hat with dark petroleum teal band, holding a small petroleum teal suitcase on the left, raising its right claw toward distant green coastal hills and a warm sand-colored sun, one little bird and minimal teal water ripples. Keep the exact rear-facing pose, coastal composition, original soft flat textured illustration style, recognizable design and colors. Center this ONE complete vignette on square canvas, occupy most of width, keep all parts uncropped with small margin. Remove all white background, labels, text, borders, other mascots and other logos. Genuine transparent alpha background, not checkerboard, no white matte, no drop shadow. No text.

Prompt da pose com mapa:

> Use case: background-extraction. Asset type: transparent PNG mascot illustration for Guia Parnanguara app route planning area. Input image is the EDIT TARGET brand board. Extract and faithfully reconstruct ONLY the illustration under CARANGUEJO E MAPA, third illustration in middle row: the friendly coral red crab with eye stalks, sand straw hat with dark petroleum teal band, smiling behind an unfolded petroleum teal and mangrove green map with small sand-colored island markings. Preserve its original recognizable face, claws, body, pose, hat, soft flat textured illustration style and palette. Include only crab, hat and unfolded map. Remove sun behind crab, white background, labels, text, borders, waves, other mascots and logos. Center full body illustration large on a square transparent canvas with small margin, all parts uncropped. Genuine transparent alpha background, no checkerboard, no white matte, no shadow, no text.
