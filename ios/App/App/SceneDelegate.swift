import UIKit
import Capacitor
import AppTrackingTransparency

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }

    // App Tracking Transparency chiesta dal lato nativo appena la scena è attiva:
    // iOS mostra il popup solo con l'app in primo piano e ignora le richieste fatte troppo presto.
    // Il codice web (monetization.js) aspetta la risposta prima di inizializzare AdMob.
    // Se iOS scarta la richiesta (scena non ancora pronta, altra finestra di sistema aperta) la si ripete
    // a intervalli crescenti finché lo stato resta "non determinato".
    func sceneDidBecomeActive(_ scene: UIScene) {
        guard #available(iOS 14, *) else { return }
        for delay in [1.5, 3.0, 5.0, 8.0, 12.0] {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
                guard UIApplication.shared.applicationState == .active,
                      ATTrackingManager.trackingAuthorizationStatus == .notDetermined else { return }
                NSLog("[ATT] richiesta dopo %.1f s", delay)
                ATTrackingManager.requestTrackingAuthorization { status in
                    NSLog("[ATT] risposta: %d", status.rawValue)
                }
            }
        }
    }
}
