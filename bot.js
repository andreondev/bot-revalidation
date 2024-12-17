const { TIMEOUT } = require('dns');
const { chromium } = require('playwright');
const cliProgress = require('cli-progress'); 

(async () => {



    const browser = await chromium.launch({headless: false,slowMo: 2000 }); 
    const page = await browser.newPage();


    await page.goto('https://fmsteresina.gestorsolucao.net.br/');
    console.log('Pagina carregado com sucesso!');


    await page.getByPlaceholder('Usuário').click();
    await page.getByPlaceholder('Usuário').fill('raimundoaraujo');
    await page.getByRole('button', { name: 'Próximo' }).click();
    await page.locator('#seleciona_estabelecimento').selectOption('2369370|2');
    await page.getByPlaceholder('Senha').fill('saude652201');
    await page.getByRole('button', { name: 'Entrar' }).click();
    console.log('Login bem sucedido!')

    await page.getByText('Solicitação de Regulação').click();
    await page.getByLabel('Situação').selectOption('R');
    await page.getByLabel('Data de Cadastro').click();
    await page.locator('#marcacao_solicita_regulacao__data_cadastro').fill('01022024');
    await page.locator('#marcacao_solicita_regulacao__data_cadastro_faixa2').click();
    await page.locator('#marcacao_solicita_regulacao__data_cadastro_faixa2').fill('17122024');
    await page.getByText('Filtrar').click();
    console.log('Filtrando revalidações..');

    await page.waitForTimeout(3000);

    let hasNextPage = true;

    while (hasNextPage) {
        // Localize todas as linhas com a classe 'gbgr'
        const rows = await page.locator('.gbgr').all();
        const totalRows = rows.length;

        const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progressBar.start(totalRows, 0); // Inicia a barra



        // Iterar sobre as linhas e limitar até a 9ª
        for (let i = 0; i < totalRows; i++) {
            progressBar.update(i + 1);

            // Ação em cada linha (exemplo: clique)
            console.log(`Interagindo com a linha ${i + 1}..`);
            await rows[i].click();

            try {


                // Tenta clicar no botão 'SIM'
                await page.getByRole('button', { name: 'SIM' }).click();
                // Se encontrou o botão SIM, clique em OK e vá para "Marcação"
                await page.getByRole('button', { name: 'OK' }).click();
                await page.getByRole('link', { name: 'Marcacao' }).click();
                await page.getByText('Solicitação de Regulação').click();
                console.log('Revalidação concluída!');
            } catch (error) {
                // Se o botão "SIM" não foi encontrado, retorna para "Marcação" e repete o processo
                console.log('Botão "SIM" não encontrado, retornando para "Marcação"...');
                await page.getByRole('link', { name: 'Marcacao' }).click();
                await page.getByText('Solicitação de Regulação').click();
                await page.waitForTimeout(1500); // Aguarda o processo se reiniciar
            }

            await page.waitForTimeout(1000);

            if (i === totalRows - 2) { // Quando restar apenas 1 linha
                console.log('Faltando apenas uma linha, avançando para a próxima página...');
                break; // Sai do loop e avança para a próxima página
            }    
        }

        progressBar.stop();

        // Tentar clicar no botão "Próxima »"
        const nextPageButton = page.locator('.spag', { hasText: 'Próxima »' });
        console.log('proxima pagina encontrada')

        if (await nextPageButton.isVisible()) {
            await nextPageButton.click();
            console.log('Avançando para a próxima página...');
            await page.waitForLoadState('networkidle'); // Aguarde o carregamento da página
        } else {
            console.log('Botão "Próxima" não encontrado, encerrando o loop.');
            hasNextPage = false; // Finaliza o loop se não houver próxima página
        }
    }


    console.log('Processo concluído.');
    await browser.close();
})();