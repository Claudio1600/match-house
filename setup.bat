@echo off
echo ========================================
echo   Match House - Setup automatico
echo ========================================
echo.

REM Backend
echo [1/4] Installazione dipendenze backend...
cd apps\backend
call npm install
if %errorlevel% neq 0 ( echo ERRORE: npm install backend fallito & pause & exit /b 1 )

echo [2/4] Creazione tabelle database (Prisma migrate)...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
  echo Tentativo con migrate dev...
  call npx prisma migrate dev --name init
)

echo [3/4] Popolamento database con dati di esempio...
call npx prisma db seed
if %errorlevel% neq 0 ( echo AVVISO: seed fallito, continuo... )

REM Mobile
cd ..\..\apps\mobile
echo [4/4] Installazione dipendenze mobile...
call npm install
if %errorlevel% neq 0 ( echo ERRORE: npm install mobile fallito & pause & exit /b 1 )

cd ..\..
echo.
echo ========================================
echo   Setup completato!
echo.
echo   Per avviare il backend:
echo     cd apps\backend ^&^& npm run dev
echo.
echo   Per avviare il mobile:
echo     cd apps\mobile ^&^& npx expo start
echo ========================================
pause
