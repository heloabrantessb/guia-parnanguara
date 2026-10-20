# Experimento do mascote

Branch: `feat/mascote-caranguejo`.

A base visual e as alterações locais existentes foram preservadas no primeiro commit deste checkout experimental. O commit seguinte contém somente o mascote e sua integração. O checkout original não foi modificado.

## Aplicação

- Tela inicial: ilustração ao lado do convite para conhecer Paranaguá.
- Login: mascote no cabeçalho de boas-vindas.
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
- A API não estava disponível na prévia. Esta alteração não modifica a integração com a API.
- Android e iOS ainda precisam de conferência em dispositivo ou emulador.

Para rodar neste checkout: `npx expo start --web --port 8082`.
