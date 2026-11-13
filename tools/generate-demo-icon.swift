import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let context = CGContext(
    data: nil, width: 1024, height: 1024, bitsPerComponent: 8,
    bytesPerRow: 4096, space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
)!
context.setFillColor(CGColor(gray: 0.055, alpha: 1))
context.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
context.setStrokeColor(CGColor(gray: 1, alpha: 1))
context.setLineWidth(112)
context.setLineCap(.square)
context.move(to: CGPoint(x: 360, y: 278))
context.addLine(to: CGPoint(x: 360, y: 718))
context.strokePath()
context.setLineCap(.butt)
context.move(to: CGPoint(x: 360, y: 552))
context.addCurve(to: CGPoint(x: 688, y: 666), control1: CGPoint(x: 414, y: 728), control2: CGPoint(x: 556, y: 754))
context.strokePath()
let output = CommandLine.arguments.dropFirst().first ?? "examples/native/assets/icon.png"
let destination = CGImageDestinationCreateWithURL(URL(fileURLWithPath: output) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(destination, context.makeImage()!, nil)
guard CGImageDestinationFinalize(destination) else { fatalError("Could not write demo icon") }
