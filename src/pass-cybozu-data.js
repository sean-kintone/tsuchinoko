(function() {
    const cybozuData = {
        requestToken: cybozu.data.REQUEST_TOKEN,
        isGaroonAvailable: typeof garoon !== 'undefined'
    };
    
    document.body.dispatchEvent(new CustomEvent('pass-cybozu-data', {
        detail: cybozuData
    }));
})();