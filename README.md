# Twitter Collection Button
Twitter（現X）Webクライアント上に、指定のコレクションへツイートを追加するボタンを追加するFirefox用アドオンです。  
正常に追加した場合ボタンが緑になり、再度クリックすることでコレクションからの削除が可能です。エラー時は赤くなります。

# Usage
- `about:addons`のファイルからアドオンをインストールを選択し、.zipファイルをインストールします
- 拡張機能の設定画面を開き、`Collection ID`を入力して保存します

# Known issues
- スクロールでツイートが画面外に出るとボタン色がリセットされてしまいます
    - 動作に致命的な影響はありませんが、不便なのでそのうち直すかもしれません

## Additional options
- 使用したいアカウントのCookieの`auth_token``ct0`を入力することで別アカウントとしてAPIにリクエストを送れます。Collectionの所有ユーザーが異なる場合など、パーミッション周りで必要な場合に設定してください。
    - 多分旧TweetDeckが公式には廃止された今Collectionを使い続けるユーザーであればある程度この辺り分かりそうなので、詳しい説明は省きます
    - いつまで使えるか分からないし…