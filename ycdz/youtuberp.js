// ==UserScript==
// @name         YouTube Ad Blocker (Simplified) - 适用于 Shadowrocket
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  尝试通过修改请求来屏蔽 YouTube 移动应用中的广告。
// @author       You (and lonely0811, original author)
// @match        *://*.googlevideo.com/*
// @match        *://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- 核心逻辑：处理请求 ---
    function handleRequest(request) {
        try {
            // 解析 JSON 请求体
            let body = JSON.parse(request.body);

            // 检查是否存在 adSignalsInfo.params，并清空
            if (body?.context?.adSignalsInfo?.params) {
                body.context.adSignalsInfo.params = [];  // 移除广告参数
                request.body = JSON.stringify(body); // 更新请求体
            }

            // 检查并移除"shorts"相关的内容
           if(body?.contents?.richGridRenderer?.contents){
                removeShorts(body.contents.richGridRenderer.contents)
           }
           if(body?.contents?.twoColumnBrowseResultsRenderer?.tabs){
               removeTabRenderer(body.contents.twoColumnBrowseResultsRenderer.tabs)
           }
           if(body?.onResponseReceivedActions){
              removeResponseReceivedActions(body.onResponseReceivedActions)
           }
        } catch (error) {
            console.error("YouTube Ad Block Error:", error);
            // 出错时不进行任何操作，避免影响正常播放
        }
        return request;
    }
    function removeResponseReceivedActions(contents){

        if(Array.isArray(contents)){
            for (let i = contents.length - 1; i >= 0; i--) {
                if(contents[i]?.reloadContinuationItemsCommand || contents[i]?.appendContinuationItemsAction){
                    let items = contents[i]?.reloadContinuationItemsCommand?.continuationItems || contents[i]?.appendContinuationItemsAction?.continuationItems;
                    if(items){
                        removeShorts(items);
                    }

                }
            }
        }
    }

    function removeTabRenderer(tabs){
        if(Array.isArray(tabs)){
             for (let i = tabs.length - 1; i >= 0; i--) {
                //移除shorts的tab
                if(tabs[i]?.tabRenderer?.content?.richGridRenderer?.contents){
                     removeShorts(tabs[i].tabRenderer.content.richGridRenderer.contents);
                }
             }
        }
    }

    //从richGridRenderer中
    function removeShorts(contents) {
         if(Array.isArray(contents)){
            for (let i = contents.length - 1; i >= 0; i--) {
                // 检查并移除 richSectionRenderer
                if (contents[i]?.richSectionRenderer?.content?.reelShelfRenderer) {
                    contents.splice(i, 1);
                    continue;
                }

                //如果存在richItemRenderer,移除广告
                if(contents[i]?.richItemRenderer?.content?.videoWithContextRenderer?.videoRendererContent){
                     let eml = contents[i]?.richItemRenderer?.content?.videoWithContextRenderer?.videoRendererContent?.renderInfo?.layoutRender?.eml;
                    if(eml && isAdEml(eml)){
                         contents.splice(i, 1);
                         continue;
                    }
                }
            }
         }
    }

    //判断是否为广告
    function isAdEml(eml) {
         const adKeywords = [
                "googleads",
                "doubleclick",
                "adservice",
                "pagead",
                // 可以根据需要添加更多关键词
            ];
        let key = eml.split("|")[0];
        for (const keyword of adKeywords) {
            if (key.includes(keyword)) {
                return true; // 包含广告关键词
            }
        }
        return false; // 不包含广告关键词
    }
    // --- Shadowrocket 集成 ---

    if ($request.url.indexOf('googlevideo.com/initplayback') !== -1) {
        // 处理 googlevideo.com/initplayback 请求（移除 Range 头）
        let headers = $request.headers;
        if (headers.hasOwnProperty('Range')) {
            delete headers['Range'];
        }
        $done({ headers });

    } else if ($request.url.indexOf("youtubei/v1/player") !== -1 && $request.method === "POST") {
          // 处理 youtubei/v1/player 请求 (POST 方法)
        let request = {
            url:$request.url,
            headers:$request.headers,
            body:$request.body
        }

        let modifiedRequest = handleRequest(request);
        $done({
            url: modifiedRequest.url,
            headers: modifiedRequest.headers,
            body: modifiedRequest.body,
            // bodyBytes: modifiedRequest.bodyBytes // 如果使用 bodyBytes
        });

    }else if ($request.url.indexOf("youtubei/v1/browse") !== -1 && $request.method === "POST") {
        // 处理 youtubei/v1/browse 请求 (POST 方法)
        let request = {
            url:$request.url,
            headers:$request.headers,
            body:$request.body
        }
        let modifiedRequest = handleRequest(request);
        $done({
            url: modifiedRequest.url,
            headers: modifiedRequest.headers,
            body: modifiedRequest.body,
            // bodyBytes: modifiedRequest.bodyBytes // 如果使用 bodyBytes
        });
    }
     else {
        // 其他请求，不处理
        $done({});
    }
})();
