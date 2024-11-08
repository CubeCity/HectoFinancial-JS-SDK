# HectoFinancial-JS-SDK
헥토파이낸셜(세틀뱅크)에서 제공하는 Javascript SDK의 개선 버전으로, UX와 각종 버그를 수정하여 사용자 경험을 향상시켰습니다.

# 설치 방법
## 스크립트 내려받기
   [여기를 눌러](https://cdn.jsdelivr.net/gh/CubeCity/HectoFinancial-JS-SDK@latest/HectoPG.min.js) 압축된 최신 SDK 파일을 내려받고 웹사이트에 `<script>` 태그로 적용하세요.

## jsDelivr CDN 사용하기
   HTML 파일에 아래와 같이 직접 링크를 추가할 수 있습니다.
   ```html
   <script src="https://cdn.jsdelivr.net/gh/CubeCity/HectoFinancial-JS-SDK@latest/HectoPG.min.js"></script>
   ```

# 사용 방법
사용 방법은 [헥토파이낸셜 개발 가이드](https://develop.sbsvc.online/16/onlineDocList.do)에 명시된 바와 같으나, `ui` 설정에 두 가지 매개변수가 추가됩니다.
```js
ui: {
    ...
    cornerRadius: "8", // 결제창 모서리에 곡률을 추가합니다. (px 단위)
    showCloseButton: true // '닫기' 단추를 결제창 내부 우측 상단에 표시합니다. (페이코 등 '닫기' 단추가 없는 결제 수단에 사용)
}
```

# 알려진 문제점
 * 네이버페이 결제 시 헥토파이낸셜측에서 결제 화면을 `iframe` 형태로 보내주는 관계로, 네이버페이 결제 시 `iframe`을 사용할 수 없습니다.

# 라이선스
[BSD 3-Clause 라이선스](https://github.com/CubeCity/HectoFinancial-JS-SDK/blob/main/LICENSE)