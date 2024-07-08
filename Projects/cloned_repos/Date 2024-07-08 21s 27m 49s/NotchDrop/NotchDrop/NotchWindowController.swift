//
//  NotchWindowController.swift
//  NotchDrop
//
//  Created by 秋星桥 on 2024/7/7.
//

import Cocoa

private let notchHeight: CGFloat = 200

class NotchWindowController: NSWindowController {
    var vm: NotchViewModel?
    weak var screen: NSScreen?

    init(window: NSWindow, screen: NSScreen) {
        self.screen = screen

        super.init(window: window)

        let vm = NotchViewModel()
        self.vm = vm
        contentViewController = NotchViewController(vm)

        let notchSize = screen.notchSize
        vm.deviceNotchRect = CGRect(
            x: screen.frame.origin.x + (screen.frame.width - notchSize.width) / 2,
            y: screen.frame.origin.y + screen.frame.height - notchSize.height,
            width: notchSize.width,
            height: notchSize.height
        )
        window.makeKeyAndOrderFront(nil)

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak vm] in
            vm?.screenRect = screen.frame
            vm?.notchOpen(.boot)
        }
    }

    @available(*, unavailable)
    required init?(coder _: NSCoder) { fatalError() }

    convenience init(screen: NSScreen) {
        let window = NotchWindow(
            contentRect: screen.frame,
            styleMask: [.borderless, .fullSizeContentView],
            backing: .buffered,
            defer: false,
            screen: screen
        )
        self.init(window: window, screen: screen)

        let topRect = CGRect(
            x: screen.frame.origin.x,
            y: screen.frame.origin.y + screen.frame.height - notchHeight,
            width: screen.frame.width,
            height: notchHeight
        )
        window.setFrameOrigin(topRect.origin)
        window.setContentSize(topRect.size)
    }

    deinit {
        destroy()
    }

    func destroy() {
        vm?.destroy()
        vm = nil
        window?.close()
        contentViewController = nil
        window = nil
    }
}
