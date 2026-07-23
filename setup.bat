@echo off
echo ========================================
echo   Match House - Setup automatico
echo ========================================
echo.
echo PREREQUISITI:
echo   - Node.js installato (nodejs.org)
echo   - File apps\backend\.env configurato
echo     (copia .env.example e inserisci le credenziali)
echo.
pause

REM Backend
echo.
echo [1/5] Installazione dipendenze backend...
cd apps\backend
call npm install
if %errorlevel% neq 0 ( echo ERRORE: npm install backend fallito & pause & exit /b 1 )

echo [2/5] Generazione Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 ( echo ERRORE: prisma generate fallito & pause & exit /b 1 )

echo [3/5] Applicazione migrazioni database...
call npx prisma migrate deploy
if %errorlevel% neq 0 ( echo ERRORE: prisma migrate deploy fallito & pause & exit /b 1 )

echo [4/5] Popolamento database con dati di esempio...
call npx prisma db seed
if %errorlevel% neq 0 ( echo AVVISO: seed fallito ^(forse gia eseguito^), continuo... )

REM Mobile
cd ..\..\apps\mobile
echo [5/5] Installazione dipendenze mobile...
call npm install
if %errorlevel% neq 0 ( echo ERRORE: npm install mobile fallito & pause & exit /b 1 )

cd ..\..
echo.
echo ========================================
echo   Setup completato!
echo.
echo   Avvia il backend:   start-backend.bat
echo   Avvia il mobile:    start-mobile.bat
echo ========================================
pause
