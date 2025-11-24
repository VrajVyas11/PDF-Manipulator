import React from 'react';
import { useRedactionCapability } from '@embedpdf/plugin-redaction/react';

const RedactionMenu = (props) => {
  const { provides } = useRedactionCapability();
  if (!props.selected) return null;
  return (
    <div {...props.menuWrapperProps}>
      <div
        className='bg-black/40 backdrop-blur-md p-2 rounded-xl flex flex-row justify-center items-center'
        style={{
          position: 'absolute',
          top: props.rect.size.height + 10,
          left: 0,
          pointerEvents: 'auto'
        }}
      >
        <button className='bg-red-500 text-xs rounded-[9px] px-4 py-2' onClick={() => provides?.commitPending(props.item.page, props.item.id)}>Add</button>
        <button className='text-xs rounded-xl px-4 py-2' onClick={() => provides?.removePending(props.item.page, props.item.id)}>Remove</button>
      </div>
    </div>
  );
};

export default RedactionMenu;