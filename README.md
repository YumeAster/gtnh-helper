# GTNH Helper

Vite + React + Tailwind 기반의 GregTech: New Horizons 플레이 보조 웹앱 프로토타입입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드 확인

```bash
npm run build
npm run preview
```

## GitHub Pages 배포

이 프로젝트에는 `.github/workflows/deploy.yml`이 포함되어 있습니다.

1. 프로젝트 전체를 GitHub 저장소의 `main` 브랜치에 push합니다.
2. GitHub 저장소에서 **Settings → Pages**로 이동합니다.
3. **Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
4. **Actions** 탭에서 `Deploy to GitHub Pages`가 성공하는지 확인합니다.

Vite `base` 옵션은 `./`로 설정되어 있어서 저장소 이름이 바뀌어도 경로가 비교적 덜 꼬입니다.

## 현재 한계

일부 레시피는 placeholder입니다. 계산 결과를 실제 플레이 기준으로 믿기 전에, 사용 중인 GTNH 팩 버전의 레시피와 대조해서 검증해야 합니다.
