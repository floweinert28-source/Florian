// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "JournalCore",
    defaultLocalization: "de",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
    ],
    products: [
        .library(name: "JournalCore", targets: ["JournalCore"]),
    ],
    targets: [
        .target(
            name: "JournalCore",
            swiftSettings: [
                .swiftLanguageMode(.v6),
            ]
        ),
        .testTarget(
            name: "JournalCoreTests",
            dependencies: ["JournalCore"],
            swiftSettings: [
                .swiftLanguageMode(.v6),
            ]
        ),
    ]
)
