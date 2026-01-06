# 🖨️ Configuração da Impressora Epson TM-T20X

## Modelo: TM-T20X (M352A)
**Tipo:** Impressora Térmica 80mm  
**Interface:** USB  
**Protocolo:** ESC/POS

---

## 📋 Passo a Passo

### 1️⃣ Instalar Driver da Epson

1. Baixe o driver oficial em: https://epson.com.br/Suporte/Ponto-de-venda/TM-T20X/s/SPT_C31CH26011
2. Ou use o driver genérico "Generic / Text Only" do Windows
3. Conecte a impressora via USB
4. Verifique se foi reconhecida em **Painel de Controle > Dispositivos e Impressoras**

### 2️⃣ Compartilhar a Impressora

1. Vá em **Painel de Controle > Dispositivos e Impressoras**
2. Clique com botão direito na impressora **EPSON TM-T20X**
3. Selecione **Propriedades da impressora**
4. Aba **Compartilhamento**
5. Marque **Compartilhar esta impressora**
6. Em "Nome do compartilhamento" coloque: `Termica` (sem acentos!)
7. Clique **OK**

### 3️⃣ Configurar no Sistema

1. Abra o **Mercadinho PDV** (versão Electron/Desktop)
2. Vá em **Configurações > Hardware**
3. Em "Nome do Compartilhamento" digite: `Termica`
4. Clique em **Salvar Configurações**

---

## 🧪 Testar Impressão

### Teste Rápido via PowerShell

Abra o PowerShell e execute:

```powershell
# Criar arquivo de teste
$teste = @"
================================================
        TESTE DE IMPRESSORA TERMICA
================================================

Impressora: Epson TM-T20X
Data: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

Este e um teste de impressao.
Se voce esta lendo isso, a impressora
esta funcionando corretamente!

------------------------------------------------
Caracteres especiais: R$ 1.234,56
Acentuacao: nao funciona em modo RAW
------------------------------------------------

================================================
          FIM DO TESTE
================================================
"@

# Salvar arquivo temporário
$teste | Out-File -FilePath "$env:TEMP\teste_termica.txt" -Encoding ASCII

# Enviar para impressora compartilhada
copy /b "$env:TEMP\teste_termica.txt" "\\localhost\Termica"

Write-Host "✅ Teste enviado para impressora!"
```

### Teste via CMD (mais simples)

```cmd
echo TESTE DE IMPRESSAO > %TEMP%\teste.txt
echo Data: %DATE% %TIME% >> %TEMP%\teste.txt
echo Epson TM-T20X OK! >> %TEMP%\teste.txt
copy /b %TEMP%\teste.txt \\localhost\Termica
```

---

## 🔧 Solução de Problemas

### ❌ Erro: "Impressora não configurada"
- Verifique se o nome do compartilhamento está correto
- Vá em Configurações > Hardware e salve novamente

### ❌ Erro: "O sistema não pode encontrar o caminho"
- A impressora não está compartilhada corretamente
- Verifique: `net share` no CMD deve mostrar "Termica"

### ❌ Impressora não imprime nada
1. Verifique se há papel na impressora
2. Verifique se a impressora está online (luz verde)
3. Teste impressão direto pelo Windows (botão direito > Imprimir página de teste)

### ❌ Caracteres estranhos na impressão
- Normal! Acentos não funcionam em modo RAW
- O sistema já trata isso removendo acentos automaticamente

---

## 📐 Especificações da TM-T20X

| Característica | Valor |
|---------------|-------|
| Largura do papel | 80mm |
| Velocidade | 200mm/s |
| Resolução | 203 dpi |
| Corte | Guilhotina automática |
| Conexão | USB 2.0 |
| Comandos | ESC/POS |

---

## 🖨️ Configurações Avançadas (Opcional)

### Usar Driver ESC/POS Direto (Performance)

Se quiser melhor performance, pode configurar a impressora como "Generic / Text Only":

1. **Painel de Controle > Impressoras**
2. **Adicionar impressora**
3. **Adicionar impressora local**
4. Selecione a porta USB da Epson
5. Fabricante: **Generic**, Modelo: **Generic / Text Only**
6. Nome: `EpsonTermica`
7. Compartilhe como `Termica`

---

## ✅ Checklist Final

- [ ] Driver instalado
- [ ] Impressora reconhecida no Windows
- [ ] Impressora compartilhada como "Termica"
- [ ] Nome configurado no sistema
- [ ] Teste de impressão OK

