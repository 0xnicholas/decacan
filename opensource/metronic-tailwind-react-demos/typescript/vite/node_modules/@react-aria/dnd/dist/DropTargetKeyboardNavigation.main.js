var $2pOR2$reactstatelycollections = require("@react-stately/collections");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "navigate", () => $6e16de4c92a0f271$export$ff7962acd6052c28);

function $6e16de4c92a0f271$export$ff7962acd6052c28(keyboardDelegate, collection, target, direction, rtl = false, wrap = false) {
    switch(direction){
        case 'left':
            return rtl ? $6e16de4c92a0f271$var$nextDropTarget(keyboardDelegate, collection, target, wrap, 'left') : $6e16de4c92a0f271$var$previousDropTarget(keyboardDelegate, collection, target, wrap, 'left');
        case 'right':
            return rtl ? $6e16de4c92a0f271$var$previousDropTarget(keyboardDelegate, collection, target, wrap, 'right') : $6e16de4c92a0f271$var$nextDropTarget(keyboardDelegate, collection, target, wrap, 'right');
        case 'up':
            return $6e16de4c92a0f271$var$previousDropTarget(keyboardDelegate, collection, target, wrap);
        case 'down':
            return $6e16de4c92a0f271$var$nextDropTarget(keyboardDelegate, collection, target, wrap);
    }
}
function $6e16de4c92a0f271$var$nextDropTarget(keyboardDelegate, collection, target, wrap = false, horizontal = null) {
    if (!target) return {
        type: 'root'
    };
    if (target.type === 'root') {
        var _keyboardDelegate_getFirstKey;
        var _keyboardDelegate_getFirstKey1;
        let nextKey = (_keyboardDelegate_getFirstKey1 = (_keyboardDelegate_getFirstKey = keyboardDelegate.getFirstKey) === null || _keyboardDelegate_getFirstKey === void 0 ? void 0 : _keyboardDelegate_getFirstKey.call(keyboardDelegate)) !== null && _keyboardDelegate_getFirstKey1 !== void 0 ? _keyboardDelegate_getFirstKey1 : null;
        if (nextKey != null) return {
            type: 'item',
            key: nextKey,
            dropPosition: 'before'
        };
        return null;
    }
    if (target.type === 'item') {
        var _keyboardDelegate_getKeyRightOf, _keyboardDelegate_getKeyLeftOf, _keyboardDelegate_getKeyBelow;
        let nextKey = null;
        if (horizontal) nextKey = horizontal === 'right' ? (_keyboardDelegate_getKeyRightOf = keyboardDelegate.getKeyRightOf) === null || _keyboardDelegate_getKeyRightOf === void 0 ? void 0 : _keyboardDelegate_getKeyRightOf.call(keyboardDelegate, target.key) : (_keyboardDelegate_getKeyLeftOf = keyboardDelegate.getKeyLeftOf) === null || _keyboardDelegate_getKeyLeftOf === void 0 ? void 0 : _keyboardDelegate_getKeyLeftOf.call(keyboardDelegate, target.key);
        else nextKey = (_keyboardDelegate_getKeyBelow = keyboardDelegate.getKeyBelow) === null || _keyboardDelegate_getKeyBelow === void 0 ? void 0 : _keyboardDelegate_getKeyBelow.call(keyboardDelegate, target.key);
        let nextCollectionKey = collection.getKeyAfter(target.key);
        // If the keyboard delegate did not move to the next key in the collection,
        // jump to that key with the same drop position. Otherwise, try the other
        // drop positions on the current key first.
        if (nextKey != null && nextKey !== nextCollectionKey) return {
            type: 'item',
            key: nextKey,
            dropPosition: target.dropPosition
        };
        switch(target.dropPosition){
            case 'before':
                return {
                    type: 'item',
                    key: target.key,
                    dropPosition: 'on'
                };
            case 'on':
                {
                    // If there are nested items, traverse to them prior to the "after" position of this target.
                    // If the next key is on the same level, then its "before" position is equivalent to this item's "after" position.
                    let targetNode = collection.getItem(target.key);
                    let nextNode = nextKey != null ? collection.getItem(nextKey) : null;
                    if (targetNode && nextNode && nextNode.level >= targetNode.level) return {
                        type: 'item',
                        key: nextNode.key,
                        dropPosition: 'before'
                    };
                    return {
                        type: 'item',
                        key: target.key,
                        dropPosition: 'after'
                    };
                }
            case 'after':
                {
                    // If this is the last sibling in a level, traverse to the parent.
                    let targetNode = collection.getItem(target.key);
                    if (targetNode && targetNode.nextKey == null && targetNode.parentKey != null) {
                        // If the parent item has an item after it, use the "before" position.
                        let parentNode = collection.getItem(targetNode.parentKey);
                        if ((parentNode === null || parentNode === void 0 ? void 0 : parentNode.nextKey) != null) return {
                            type: 'item',
                            key: parentNode.nextKey,
                            dropPosition: 'before'
                        };
                        if (parentNode) return {
                            type: 'item',
                            key: parentNode.key,
                            dropPosition: 'after'
                        };
                    }
                    if ((targetNode === null || targetNode === void 0 ? void 0 : targetNode.nextKey) != null) return {
                        type: 'item',
                        key: targetNode.nextKey,
                        dropPosition: 'on'
                    };
                }
        }
    }
    if (wrap) return {
        type: 'root'
    };
    return null;
}
function $6e16de4c92a0f271$var$previousDropTarget(keyboardDelegate, collection, target, wrap = false, horizontal = null) {
    // Start after the last root-level item.
    if (!target || wrap && target.type === 'root') {
        var _keyboardDelegate_getLastKey;
        // Keyboard delegate gets the deepest item but we want the shallowest.
        let prevKey = null;
        let lastKey = (_keyboardDelegate_getLastKey = keyboardDelegate.getLastKey) === null || _keyboardDelegate_getLastKey === void 0 ? void 0 : _keyboardDelegate_getLastKey.call(keyboardDelegate);
        while(lastKey != null){
            prevKey = lastKey;
            let node = collection.getItem(lastKey);
            lastKey = node === null || node === void 0 ? void 0 : node.parentKey;
        }
        if (prevKey != null) return {
            type: 'item',
            key: prevKey,
            dropPosition: 'after'
        };
        return null;
    }
    if (target.type === 'item') {
        var _keyboardDelegate_getKeyLeftOf, _keyboardDelegate_getKeyRightOf, _keyboardDelegate_getKeyAbove;
        let prevKey = null;
        if (horizontal) prevKey = horizontal === 'left' ? (_keyboardDelegate_getKeyLeftOf = keyboardDelegate.getKeyLeftOf) === null || _keyboardDelegate_getKeyLeftOf === void 0 ? void 0 : _keyboardDelegate_getKeyLeftOf.call(keyboardDelegate, target.key) : (_keyboardDelegate_getKeyRightOf = keyboardDelegate.getKeyRightOf) === null || _keyboardDelegate_getKeyRightOf === void 0 ? void 0 : _keyboardDelegate_getKeyRightOf.call(keyboardDelegate, target.key);
        else prevKey = (_keyboardDelegate_getKeyAbove = keyboardDelegate.getKeyAbove) === null || _keyboardDelegate_getKeyAbove === void 0 ? void 0 : _keyboardDelegate_getKeyAbove.call(keyboardDelegate, target.key);
        let prevCollectionKey = collection.getKeyBefore(target.key);
        // If the keyboard delegate did not move to the next key in the collection,
        // jump to that key with the same drop position. Otherwise, try the other
        // drop positions on the current key first.
        if (prevKey != null && prevKey !== prevCollectionKey) return {
            type: 'item',
            key: prevKey,
            dropPosition: target.dropPosition
        };
        switch(target.dropPosition){
            case 'before':
                {
                    // Move after the last child of the previous item.
                    let targetNode = collection.getItem(target.key);
                    if (targetNode && targetNode.prevKey != null) {
                        let lastChild = $6e16de4c92a0f271$var$getLastChild(collection, targetNode.prevKey);
                        if (lastChild) return lastChild;
                    }
                    if (prevKey != null) return {
                        type: 'item',
                        key: prevKey,
                        dropPosition: 'on'
                    };
                    return {
                        type: 'root'
                    };
                }
            case 'on':
                return {
                    type: 'item',
                    key: target.key,
                    dropPosition: 'before'
                };
            case 'after':
                {
                    // Move after the last child of this item.
                    let lastChild = $6e16de4c92a0f271$var$getLastChild(collection, target.key);
                    if (lastChild) return lastChild;
                    return {
                        type: 'item',
                        key: target.key,
                        dropPosition: 'on'
                    };
                }
        }
    }
    if (target.type !== 'root') return {
        type: 'root'
    };
    return null;
}
function $6e16de4c92a0f271$var$getLastChild(collection, key) {
    // getChildNodes still returns child tree items even when the item is collapsed.
    // Checking if the next item has a greater level is a silly way to determine if the item is expanded.
    let targetNode = collection.getItem(key);
    let nextKey = collection.getKeyAfter(key);
    let nextNode = nextKey != null ? collection.getItem(nextKey) : null;
    if (targetNode && nextNode && nextNode.level > targetNode.level) {
        let children = (0, $2pOR2$reactstatelycollections.getChildNodes)(targetNode, collection);
        let lastChild = null;
        for (let child of children)if (child.type === 'item') lastChild = child;
        if (lastChild) return {
            type: 'item',
            key: lastChild.key,
            dropPosition: 'after'
        };
    }
    return null;
}


//# sourceMappingURL=DropTargetKeyboardNavigation.main.js.map
