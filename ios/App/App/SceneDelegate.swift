import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        let controller = CAPBridgeViewController()
        window?.rootViewController = controller
        window?.makeKeyAndVisible()

        hideScrollIndicators(on: controller)

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    /// Desliga o indicador de scroll da WebView.
    ///
    /// O indicador do scroller principal é uma `UIScrollView` do sistema, e o
    /// CSS não lhe chega: `::-webkit-scrollbar` só governa scrollers CSS
    /// aninhados, por isso escondê-lo na folha de estilos não tem efeito
    /// nenhum aqui. A direção visual pede ecrãs sem barra colada à margem
    /// direita. O scroll em si fica igual, momentum incluído — o que
    /// desaparece é só a pista de posição.
    private func hideScrollIndicators(on controller: CAPBridgeViewController) {
        let apply = {
            controller.webView?.scrollView.showsVerticalScrollIndicator = false
            controller.webView?.scrollView.showsHorizontalScrollIndicator = false
        }
        apply()
        // A `webView` nasce em `viewDidLoad`. Se ainda não existir neste ponto,
        // a segunda passagem apanha-a com a hierarquia de vistas já montada.
        DispatchQueue.main.async(execute: apply)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
