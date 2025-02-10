
import ExpoModulesCore
import Tss

public class MobileTssModule: Module {
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    public func definition() -> ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('MobileTss')` in JavaScript.
        Name("MobileTss")
        
        // Defines event names that the module can send to JavaScript.
        Events("onProgress","onError")
        
        // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
        Function("getDerivedPublicKey") { (hexPublicKey: String,hexChainCode: String, derivePath: String) in
            return PublicKeyHelper.getDerivedPubKey(hexPubKey: hexPublicKey, hexChainCode: hexChainCode, derivePath: derivePath)
        }
        
        // keygen function
        AsyncFunction("keygen") { (name: String, localPartyID: String, sessionID: String, hexChainCode: String, hexEncryptionKey: String, serverURL: String) in
            print("start keygen , vault name: \(name), localPartyID: \(localPartyID), sessionID: \(sessionID), hexChainCode: \(hexChainCode), hexEncryptionKey: \(hexEncryptionKey), serverURL: \(serverURL)")
            return [String: Any]()
        }
        
        
        // keysign function
        // publicKey: String, keyShares: [String:String], messages: [String], localPartyID: String, derivePath: String, sessionID: String, hexEncryptionKey: String, serverURL: String, tssType: String
        AsyncFunction("keysign") {(data: [String: Any]) in
            guard let publicKey = data["publicKey"] as? String,
                  let keyShares = data["keyShares"] as? [String: String],
                  let messages = data["messages"] as? [String],
                  let localPartyID = data["localPartyID"] as? String,
                  let derivePath = data["derivePath"] as? String,
                  let sessionID = data["sessionID"] as? String,
                  let hexEncryptionKey = data["hexEncryptionKey"] as? String,
                  let serverURL = data["serverURL"] as? String,
                  let tssType = data["tssType"] as? String else {
                throw NSError(domain: "InvalidArguments", code: 400, userInfo: [NSLocalizedDescriptionKey: "Invalid arguments"])
            }
            return [String: Any]()
        }
        
    }
}
