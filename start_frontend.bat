@echo off
title manganarrator_frontend - Next.js Frontend Launcher

REM === Run Next.js frontend ===
node scripts\sync-contracts.mjs
npm run dev