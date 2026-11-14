// Run from the repository root: swift tools/render-avatars.swift
// Original user glyphs on flat backgrounds; PNG keeps the assets native-compatible.
import Foundation
import CoreGraphics
import ImageIO
import CryptoKit

let directory = URL(fileURLWithPath: "packages/ui/assets/avatars", isDirectory: true)
try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
let palettes: [(String, UInt32, UInt32)] = [
    ("user-blue", 0xDBEAFE, 0x2563EB),
    ("user-violet", 0xEDE9FE, 0x7C3AED),
    ("user-green", 0xDCFCE7, 0x15803D),
]
func color(_ hex: UInt32) -> CGColor {
    CGColor(red: CGFloat((hex >> 16) & 255) / 255,
            green: CGFloat((hex >> 8) & 255) / 255,
            blue: CGFloat(hex & 255) / 255, alpha: 1)
}
var provenance: [[String: Any]] = []
for (name, background, foreground) in palettes {
    let context = CGContext(data: nil, width: 256, height: 256,
                            bitsPerComponent: 8, bytesPerRow: 256 * 4,
                            space: CGColorSpace(name: CGColorSpace.sRGB)!,
                            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    context.setFillColor(color(background))
    context.fill(CGRect(x: 0, y: 0, width: 256, height: 256))
    context.translateBy(x: 0, y: 256)
    context.scaleBy(x: 1, y: -1)
    context.setStrokeColor(color(foreground))
    context.setLineWidth(12)
    context.setLineCap(.round)
    context.setLineJoin(.round)
    context.strokeEllipse(in: CGRect(x: 100, y: 62, width: 56, height: 56))
    context.move(to: CGPoint(x: 70, y: 194))
    context.addLine(to: CGPoint(x: 70, y: 180))
    context.addCurve(to: CGPoint(x: 108, y: 142), control1: CGPoint(x: 70, y: 159), control2: CGPoint(x: 87, y: 142))
    context.addLine(to: CGPoint(x: 148, y: 142))
    context.addCurve(to: CGPoint(x: 186, y: 180), control1: CGPoint(x: 169, y: 142), control2: CGPoint(x: 186, y: 159))
    context.addLine(to: CGPoint(x: 186, y: 194))
    context.strokePath()
    let file = directory.appendingPathComponent(name + ".png")
    let destination = CGImageDestinationCreateWithURL(file as CFURL, "public.png" as CFString, 1, nil)!
    CGImageDestinationAddImage(destination, context.makeImage()!, nil)
    guard CGImageDestinationFinalize(destination) else { fatalError("PNG encoding failed") }
    let hash = SHA256.hash(data: try Data(contentsOf: file)).map { String(format: "%02x", $0) }.joined()
    provenance.append(["file": name + ".png", "source": "Original RightUI artwork; tools/render-avatars.swift", "license": "MIT", "sha256": hash, "purpose": "User icon on a flat color background for documentation examples"])
}
let data = try JSONSerialization.data(withJSONObject: provenance, options: [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes])
try (data + Data("\n".utf8)).write(to: directory.appendingPathComponent("provenance.json"))
print("Rendered 3 user icons at 256 × 256.")
