---
description: Commit convencional con git diff + status
agent: build
model: deepseek/deepseek-v4-flash
---

### Analiza los cambios y haz commit con mensaje convencional

!`git status --short`

!`git diff`

Con base en los cambios detectados:

1. Clasifica el tipo de cambio según conventional commits: `feat`, `fix`, `refactor`, `style`, `perf`, `chore`, `docs`, `test`
2. Genera un mensaje en español siguiendo el formato: `tipo: descripción breve en minúsculas`
3. Usa `git log --oneline -5` como referencia del estilo de commits del proyecto
4. AGREGA todos los archivos al staging con `git add .`
5. HAZ el commit con `git commit -m "mensaje"`
6. NO hagas push bajo ninguna circunstancia
