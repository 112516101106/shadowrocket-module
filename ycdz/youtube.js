// ==UserScript==
// @name         YouTube Ad Blocker (Simplified)
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Attempts to block ads on YouTube mobile app by modifying the request.
// @author       You (and lonely0811, original author)
// @match        *://*.googlevideo.com/*
// @match        *://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. Protobuf Definitions (Simplified - chỉ giữ lại phần cần thiết)
    const f = { // Field types (protobuf)
        INT32: 5,
        STRING: 9,
    };

    // Message Types (Simplified - chỉ giữ lại cấu trúc, bỏ qua các hàm tạo)
    const Request = {
        typeName: "youtube.request.common.Request",
        fields: {
            1: { name: "context", kind: "message", T: /* Context */ {} }, // T là kiểu con
        }
    };

    const Context = {
        typeName: "youtube.request.common.Context",
        fields: {
            9: { name: "adSignalsInfo", kind: "message", T: /* AdSignalsInfo */ {} },
        }
    };

    const AdSignalsInfo = {
        typeName: "youtube.request.common.AdSignalsInfo",
        fields: {
            1: { name: "params", kind: "message", T: /* Params */ {}, repeated: true },
        }
    };

    const Params = {
         typeName: "youtube.request.common.Params",
        fields: {
            1: { name: "key", kind: "scalar", T: f.STRING },
            2: { name: "value", kind: "scalar", T: f.STRING },
        }
    };


    // --- Phần quan trọng: Xử lý request ---
    function handleRequest(request) {
        try {
            // Bước 1 & 2:  (Giải mã protobuf - Giả định đã được giải mã)
            //  (Bạn *không* cần tự giải mã protobuf trong Shadowrocket script.
            //   Shadowrocket sẽ tự động giải mã nếu bạn cấu hình đúng.)
            //  let message = Request.fromBinary(request.bodyBytes);  // KHÔNG CẦN trong Shadowrocket

            // Bước 3: Sửa đổi message (Loại bỏ adSignalsInfo.params)
            let body = JSON.parse(request.body);
              if (body?.context?.adSignalsInfo?.params) {
                    body.context.adSignalsInfo.params = [];  // Xóa các tham số quảng cáo
                    request.body = JSON.stringify(body);
                }



            // Bước 4 & 5: (Mã hóa lại protobuf và trả về - Shadowrocket tự làm)
             //   request.bodyBytes = message.toBinary();    // KHÔNG CẦN trong Shadowrocket
             //   return request;  // KHÔNG CẦN trả về trực tiếp trong Shadowrocket

             // (Shadowrocket tự động gửi request đã sửa đổi)

        } catch (error) {
            console.error("YouTube Ad Block Error:", error);
            // Không làm gì nếu có lỗi (để tránh làm hỏng video)
        }
        //Không thay đổi gì trong request
        return request;
    }

    // --- Phần quan trọng:  Gắn vào Shadowrocket ---

    // Kiểm tra xem có phải là request đến YouTube và các url liên quan đến player
     if ($request.url.indexOf('googlevideo.com/initplayback') !== -1)
     {
        // Xóa header 'Range'
        let headers = $request.headers;
        if (headers.hasOwnProperty('Range')) {
            delete headers['Range'];
        }
        $done({ headers });

     }else if ($request.url.indexOf("youtubei/v1/player") !== -1 && $request.method === "POST")
     {
        let request = {
                url:$request.url,
                headers:$request.headers,
                body:$request.body,
            };
        // Xử lý request
        let modifiedRequest = handleRequest(request);
        // Gọi $done với request đã sửa hoặc request gốc.
         $done({
                url: modifiedRequest.url,
                headers: modifiedRequest.headers,
                body: modifiedRequest.body,
                //bodyBytes: modifiedRequest.bodyBytes  // Nếu bạn dùng bodyBytes
            });

     } else {
        // Không xử lý, để nguyên request
         $done({});
     }
})();
